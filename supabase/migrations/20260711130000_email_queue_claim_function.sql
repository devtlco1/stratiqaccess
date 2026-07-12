-- Atomic batch-claim function for the Email Center bulk-send queue.
--
-- The Supabase JS query builder can't express "SELECT ... FOR UPDATE SKIP
-- LOCKED" (it only builds single-statement REST calls), and a separate
-- select-then-update from application code would race under overlapping
-- cron invocations — two concurrent runs could both read the same "pending"
-- rows before either writes "sending", claiming and then sending to the same
-- recipient twice. FOR UPDATE SKIP LOCKED inside a single function call is
-- the standard Postgres pattern for a safe multi-consumer queue claim: the
-- second concurrent caller simply skips rows the first has already locked,
-- even before the first caller's transaction commits.
--
-- SECURITY DEFINER is required so the function can write regardless of the
-- caller's RLS context (the cron route uses the service-role client, which
-- already bypasses RLS, but SECURITY DEFINER also makes this callable from
-- the admin dashboard's RLS-scoped client without a separate policy). It is
-- deliberately narrow — the only operation with elevated rights is this one
-- specific status transition, not arbitrary table access.
create or replace function public.claim_campaign_recipients(
  p_campaign_id uuid,
  p_batch_size integer,
  p_locked_by text
)
returns setof public.email_campaign_recipients
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with candidates as (
    select id
    from public.email_campaign_recipients
    where campaign_id = p_campaign_id
      and status = 'pending'
    order by created_at
    limit p_batch_size
    for update skip locked
  )
  update public.email_campaign_recipients r
  set status = 'sending',
      locked_at = now(),
      locked_by = p_locked_by,
      attempt_count = r.attempt_count + 1,
      updated_at = now()
  from candidates c
  where r.id = c.id
  returning r.*;
end;
$$;

comment on function public.claim_campaign_recipients is
  'Atomically claims up to p_batch_size pending recipients for a campaign using FOR UPDATE SKIP LOCKED, transitioning them to sending. Safe under overlapping concurrent callers (e.g. overlapping cron runs).';

-- Companion sweep for recipients stuck in "sending" past a threshold (e.g. a
-- crashed process mid-batch). Deliberately does NOT revert them to "pending"
-- for automatic retry — because Hostinger's send endpoint returns 204 with
-- no message ID, there is no reliable way to confirm after the fact whether
-- a stuck send actually went out. Marking them "failed" with a distinct
-- error forces a human to check the Sent folder / recipient inbox before
-- using the "retry failed" action, rather than risking a silent duplicate.
create or replace function public.fail_stuck_sending_recipients(
  p_older_than_minutes integer default 15
)
returns setof public.email_campaign_recipients
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  update public.email_campaign_recipients
  set status = 'failed',
      locked_at = null,
      last_error = 'Stuck in "sending" past the stale threshold — status unknown, manual review required before retrying.',
      updated_at = now()
  where status = 'sending'
    and locked_at < now() - make_interval(mins => p_older_than_minutes)
  returning *;
end;
$$;

comment on function public.fail_stuck_sending_recipients is
  'Marks recipients stuck in "sending" beyond the threshold as failed for manual review — never auto-reclaims them for retry, since a send success cannot be confirmed after the fact.';
