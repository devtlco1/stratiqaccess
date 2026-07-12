-- Email Center: core schema for the new /admin/email-center module.
-- Fourteen admin-only tables (no public-read policies anywhere here — this is
-- entirely internal data, same posture as "customers"). The webhook and cron
-- routes write through a service-role Supabase client and therefore bypass
-- RLS entirely; the "admin all" policy below only governs the dashboard's
-- authenticated browser/server-action reads and writes.
--
-- Tables are ordered so every foreign key points at something already
-- created earlier in this file (no forward references, no separate
-- alter-table-add-constraint pass needed):
--   contacts -> contact_lists -> contact_list_members -> templates ->
--   attachments -> template_attachments -> campaigns -> threads ->
--   campaign_recipients -> messages -> webhook_events -> suppression_list ->
--   settings -> activity_logs

-- ============================================================================
-- email_contacts
-- ============================================================================
create table if not exists public.email_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company_name text,
  email text not null,
  email_normalized text generated always as (lower(trim(email))) stored,
  phone text,
  country text,
  city text,
  sector text,
  job_title text,
  website text,
  source text not null default 'manual'
    check (source in ('manual', 'import_customers', 'import_messages', 'csv_import', 'xlsx_import', 'paste_import', 'api')),
  source_customer_id uuid references public.customers(id) on delete set null,
  source_message_id uuid references public.messages(id) on delete set null,
  language text,
  notes text,
  tags text[] not null default '{}',
  status text not null default 'active'
    check (status in ('active', 'unsubscribed', 'bounced', 'suppressed', 'archived')),
  is_subscribed boolean not null default true,
  unsubscribed_at timestamptz,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists email_contacts_email_normalized_key on public.email_contacts (email_normalized);
create index if not exists email_contacts_status_idx on public.email_contacts (status);
create index if not exists email_contacts_source_idx on public.email_contacts (source);
create index if not exists email_contacts_country_idx on public.email_contacts (country);
create index if not exists email_contacts_sector_idx on public.email_contacts (sector);
create index if not exists email_contacts_tags_idx on public.email_contacts using gin (tags);
create index if not exists email_contacts_source_customer_idx on public.email_contacts (source_customer_id);
create index if not exists email_contacts_source_message_idx on public.email_contacts (source_message_id);

drop trigger if exists set_updated_at on public.email_contacts;
create trigger set_updated_at
  before update on public.email_contacts
  for each row
  execute function public.set_updated_at();

alter table public.email_contacts enable row level security;
drop policy if exists "admin all" on public.email_contacts;
create policy "admin all"
  on public.email_contacts
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- email_contact_lists
-- ============================================================================
create table if not exists public.email_contact_lists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists email_contact_lists_name_key on public.email_contact_lists (lower(name));

drop trigger if exists set_updated_at on public.email_contact_lists;
create trigger set_updated_at
  before update on public.email_contact_lists
  for each row
  execute function public.set_updated_at();

alter table public.email_contact_lists enable row level security;
drop policy if exists "admin all" on public.email_contact_lists;
create policy "admin all"
  on public.email_contact_lists
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- email_contact_list_members
-- ============================================================================
create table if not exists public.email_contact_list_members (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.email_contact_lists(id) on delete cascade,
  contact_id uuid not null references public.email_contacts(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists email_contact_list_members_unique on public.email_contact_list_members (list_id, contact_id);
create index if not exists email_contact_list_members_contact_idx on public.email_contact_list_members (contact_id);

drop trigger if exists set_updated_at on public.email_contact_list_members;
create trigger set_updated_at
  before update on public.email_contact_list_members
  for each row
  execute function public.set_updated_at();

alter table public.email_contact_list_members enable row level security;
drop policy if exists "admin all" on public.email_contact_list_members;
create policy "admin all"
  on public.email_contact_list_members
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- email_templates
-- ============================================================================
create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  subject text not null,
  html_body text not null,
  text_body text,
  default_language text not null default 'en',
  variables jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists email_templates_active_idx on public.email_templates (is_active);

drop trigger if exists set_updated_at on public.email_templates;
create trigger set_updated_at
  before update on public.email_templates
  for each row
  execute function public.set_updated_at();

alter table public.email_templates enable row level security;
drop policy if exists "admin all" on public.email_templates;
create policy "admin all"
  on public.email_templates
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- email_attachments (reusable attachment library, backed by the private
-- "email-attachments" Supabase Storage bucket created in the next migration)
-- ============================================================================
create table if not exists public.email_attachments (
  id uuid primary key default gen_random_uuid(),
  storage_bucket text not null default 'email-attachments',
  storage_path text not null,
  filename text not null,
  content_type text,
  size_bytes bigint,
  checksum_sha256 text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists email_attachments_path_key on public.email_attachments (storage_bucket, storage_path);
create index if not exists email_attachments_checksum_idx on public.email_attachments (checksum_sha256);

drop trigger if exists set_updated_at on public.email_attachments;
create trigger set_updated_at
  before update on public.email_attachments
  for each row
  execute function public.set_updated_at();

alter table public.email_attachments enable row level security;
drop policy if exists "admin all" on public.email_attachments;
create policy "admin all"
  on public.email_attachments
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- email_template_attachments (attachments permanently linked to a template,
-- e.g. a Company Profile PDF that rides along on every send of that template)
-- ============================================================================
create table if not exists public.email_template_attachments (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.email_templates(id) on delete cascade,
  attachment_id uuid not null references public.email_attachments(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists email_template_attachments_unique on public.email_template_attachments (template_id, attachment_id);

drop trigger if exists set_updated_at on public.email_template_attachments;
create trigger set_updated_at
  before update on public.email_template_attachments
  for each row
  execute function public.set_updated_at();

alter table public.email_template_attachments enable row level security;
drop policy if exists "admin all" on public.email_template_attachments;
create policy "admin all"
  on public.email_template_attachments
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- email_campaigns
-- ============================================================================
create table if not exists public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  template_id uuid references public.email_templates(id) on delete set null,
  -- Subject/body are snapshotted from the template at campaign creation time
  -- so editing the template later never changes what an in-flight or
  -- already-sent campaign says.
  subject_snapshot text not null,
  html_snapshot text not null,
  text_snapshot text,
  from_display_name text,
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'sending', 'paused', 'completed', 'cancelled', 'failed')),
  -- How recipients were chosen (list ids, filter criteria, manually entered
  -- addresses) — kept for the wizard's confirmation summary and audit trail.
  -- The actual send list is materialized into email_campaign_recipients.
  recipient_selection jsonb not null default '{}'::jsonb,
  attachment_ids uuid[] not null default '{}',
  batch_size integer not null default 20 check (batch_size > 0 and batch_size <= 100),
  send_interval_seconds integer not null default 120 check (send_interval_seconds >= 0),
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  total_recipients integer not null default 0,
  test_sent_to text,
  test_sent_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists email_campaigns_status_idx on public.email_campaigns (status);
create index if not exists email_campaigns_scheduled_at_idx on public.email_campaigns (scheduled_at);

drop trigger if exists set_updated_at on public.email_campaigns;
create trigger set_updated_at
  before update on public.email_campaigns
  for each row
  execute function public.set_updated_at();

alter table public.email_campaigns enable row level security;
drop policy if exists "admin all" on public.email_campaigns;
create policy "admin all"
  on public.email_campaigns
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- email_threads
--
-- NOTE ON A REAL API LIMITATION: Hostinger's Mail API send endpoint has no
-- field for In-Reply-To/References/custom headers, so outbound replies sent
-- through this app cannot carry real RFC5322 threading headers. This table
-- is therefore an INTERNAL admin-dashboard grouping only (matched by contact
-- email + normalized subject, refined by inbound messageId/inReplyTo when
-- available) — it does not make replies thread in the recipient's own mail
-- client. See docs/EMAIL_CENTER.md for the full explanation.
-- ============================================================================
create table if not exists public.email_threads (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.email_contacts(id) on delete set null,
  contact_email text not null,
  subject_normalized text not null,
  campaign_id uuid references public.email_campaigns(id) on delete set null,
  last_message_at timestamptz not null default now(),
  last_message_preview text,
  is_unread boolean not null default false,
  status text not null default 'open' check (status in ('open', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Deliberately not a hard unique constraint: thread matching uses a
-- freshness-windowed lookup in application code (two unrelated conversations
-- months apart with the same generic subject shouldn't be force-merged).
create index if not exists email_threads_lookup_idx on public.email_threads (contact_email, subject_normalized, last_message_at desc);
create index if not exists email_threads_unread_idx on public.email_threads (is_unread);
create index if not exists email_threads_contact_idx on public.email_threads (contact_id);
create index if not exists email_threads_campaign_idx on public.email_threads (campaign_id);

drop trigger if exists set_updated_at on public.email_threads;
create trigger set_updated_at
  before update on public.email_threads
  for each row
  execute function public.set_updated_at();

alter table public.email_threads enable row level security;
drop policy if exists "admin all" on public.email_threads;
create policy "admin all"
  on public.email_threads
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- email_campaign_recipients
--
-- unique(campaign_id, contact_id) is the hard guarantee against ever sending
-- the same campaign email to the same contact twice, independent of any
-- application-level idempotency logic in the queue processor.
-- ============================================================================
create table if not exists public.email_campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.email_campaigns(id) on delete cascade,
  contact_id uuid not null references public.email_contacts(id) on delete cascade,
  email_snapshot text not null,
  name_snapshot text,
  status text not null default 'pending'
    check (status in ('pending', 'queued', 'sending', 'sent', 'failed', 'skipped', 'suppressed', 'replied', 'unsubscribed')),
  locked_at timestamptz,
  locked_by text,
  attempt_count integer not null default 0,
  last_error text,
  queued_at timestamptz,
  sent_at timestamptz,
  hostinger_message_id text,
  hostinger_uid bigint,
  thread_id uuid references public.email_threads(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists email_campaign_recipients_unique on public.email_campaign_recipients (campaign_id, contact_id);
create index if not exists email_campaign_recipients_status_idx on public.email_campaign_recipients (campaign_id, status);
create index if not exists email_campaign_recipients_claim_idx on public.email_campaign_recipients (status, locked_at);
create index if not exists email_campaign_recipients_contact_idx on public.email_campaign_recipients (contact_id);
create index if not exists email_campaign_recipients_hostinger_msg_idx on public.email_campaign_recipients (hostinger_message_id);

drop trigger if exists set_updated_at on public.email_campaign_recipients;
create trigger set_updated_at
  before update on public.email_campaign_recipients
  for each row
  execute function public.set_updated_at();

alter table public.email_campaign_recipients enable row level security;
drop policy if exists "admin all" on public.email_campaign_recipients;
create policy "admin all"
  on public.email_campaign_recipients
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- email_messages (both inbound and outbound, forms the inbox/thread view)
-- ============================================================================
create table if not exists public.email_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.email_threads(id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  folder text,
  hostinger_uid bigint,
  message_id text,
  in_reply_to text,
  from_email text not null,
  from_name text,
  to_emails text[] not null default '{}',
  cc_emails text[] not null default '{}',
  bcc_emails text[] not null default '{}',
  subject text,
  body_text text,
  body_html text,
  has_attachments boolean not null default false,
  attachment_meta jsonb not null default '[]'::jsonb,
  campaign_recipient_id uuid references public.email_campaign_recipients(id) on delete set null,
  is_read boolean not null default true,
  is_draft boolean not null default false,
  message_date timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Real inbound-message dedup backstop: even if webhook-level dedup misses
-- (likely, since the webhook payload shape is undocumented), re-inserting
-- the same IMAP message a second time via ON CONFLICT DO NOTHING is a no-op.
-- Deliberately a full (non-partial) unique index, not `where hostinger_uid
-- is not null`: standard SQL unique indexes already treat NULL as never
-- equal to NULL, so outbound/draft rows (which have no hostinger_uid) never
-- conflict with each other regardless. A partial index here would also
-- silently break ON CONFLICT (folder, hostinger_uid) upserts from the
-- Supabase client, which don't repeat the partial predicate and so can't
-- infer a partial index as the arbiter.
create unique index if not exists email_messages_folder_uid_key
  on public.email_messages (folder, hostinger_uid);
create index if not exists email_messages_message_id_idx on public.email_messages (message_id);
create index if not exists email_messages_in_reply_to_idx on public.email_messages (in_reply_to);
create index if not exists email_messages_thread_idx on public.email_messages (thread_id);
create index if not exists email_messages_date_idx on public.email_messages (message_date desc);
create index if not exists email_messages_campaign_recipient_idx on public.email_messages (campaign_recipient_id);
create index if not exists email_messages_draft_idx on public.email_messages (is_draft);

drop trigger if exists set_updated_at on public.email_messages;
create trigger set_updated_at
  before update on public.email_messages
  for each row
  execute function public.set_updated_at();

alter table public.email_messages enable row level security;
drop policy if exists "admin all" on public.email_messages;
create policy "admin all"
  on public.email_messages
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- email_webhook_events
--
-- raw_body is TEXT, not JSONB: Hostinger's webhook payload shape is not
-- documented in their OpenAPI spec, so storing it as jsonb would risk the
-- one insert that must always succeed (capturing the raw event) failing on
-- malformed/unexpected content. parsed_body is populated opportunistically.
-- ============================================================================
create table if not exists public.email_webhook_events (
  id uuid primary key default gen_random_uuid(),
  received_at timestamptz not null default now(),
  mailbox_resource_id text,
  event_type text not null default 'message.received',
  dedup_key text,
  raw_body text not null,
  parsed_body jsonb,
  headers jsonb not null default '{}'::jsonb,
  processing_status text not null default 'received'
    check (processing_status in ('received', 'processing', 'processed', 'failed', 'ignored')),
  resolved_message_id uuid references public.email_messages(id) on delete set null,
  error text,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Full (non-partial) unique index for the same reason as
-- email_messages_folder_uid_key above — NULL dedup_key rows (couldn't
-- extract one) never conflict with each other under standard SQL unique
-- semantics, and a partial index here would break ON CONFLICT (dedup_key)
-- upserts from the Supabase client.
create unique index if not exists email_webhook_events_dedup_key_key
  on public.email_webhook_events (dedup_key);
create index if not exists email_webhook_events_status_idx on public.email_webhook_events (processing_status, received_at);

drop trigger if exists set_updated_at on public.email_webhook_events;
create trigger set_updated_at
  before update on public.email_webhook_events
  for each row
  execute function public.set_updated_at();

alter table public.email_webhook_events enable row level security;
drop policy if exists "admin all" on public.email_webhook_events;
create policy "admin all"
  on public.email_webhook_events
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- email_suppression_list
--
-- is_active lets a suppression be "restored" (explicit admin action) without
-- losing the historical record of why/when someone was originally
-- suppressed; unique(email_normalized) means there is always exactly one row
-- per address, updated in place rather than re-inserted.
-- ============================================================================
create table if not exists public.email_suppression_list (
  id uuid primary key default gen_random_uuid(),
  email_normalized text not null,
  original_email text not null,
  reason text not null
    check (reason in ('unsubscribed', 'bounced_hard', 'bounced_soft', 'complaint', 'manual', 'invalid')),
  source text,
  campaign_recipient_id uuid references public.email_campaign_recipients(id) on delete set null,
  notes text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  restored_at timestamptz,
  restored_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists email_suppression_list_email_key on public.email_suppression_list (email_normalized);

drop trigger if exists set_updated_at on public.email_suppression_list;
create trigger set_updated_at
  before update on public.email_suppression_list
  for each row
  execute function public.set_updated_at();

alter table public.email_suppression_list enable row level security;
drop policy if exists "admin all" on public.email_suppression_list;
create policy "admin all"
  on public.email_suppression_list
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- email_settings (singleton key/value config — NEVER stores secrets; the
-- API token, webhook secret, cron secret and service-role key all stay in
-- server-only environment variables, never in a table any authenticated
-- dashboard user could read)
-- ============================================================================
create table if not exists public.email_settings (
  key text primary key,
  value jsonb not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on public.email_settings;
create trigger set_updated_at
  before update on public.email_settings
  for each row
  execute function public.set_updated_at();

alter table public.email_settings enable row level security;
drop policy if exists "admin all" on public.email_settings;
create policy "admin all"
  on public.email_settings
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ============================================================================
-- email_activity_logs (audit trail — metadata must never contain full
-- message bodies or secrets, only truncated subjects/counts/ids/errors)
-- ============================================================================
create table if not exists public.email_activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_type text not null check (actor_type in ('user', 'system', 'webhook', 'cron')),
  actor_id uuid references auth.users(id) on delete set null,
  actor_label text,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  ip_address inet,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists email_activity_logs_entity_idx on public.email_activity_logs (entity_type, entity_id);
create index if not exists email_activity_logs_actor_idx on public.email_activity_logs (actor_id);
create index if not exists email_activity_logs_created_idx on public.email_activity_logs (created_at desc);
create index if not exists email_activity_logs_action_idx on public.email_activity_logs (action);

drop trigger if exists set_updated_at on public.email_activity_logs;
create trigger set_updated_at
  before update on public.email_activity_logs
  for each row
  execute function public.set_updated_at();

alter table public.email_activity_logs enable row level security;
drop policy if exists "admin all" on public.email_activity_logs;
create policy "admin all"
  on public.email_activity_logs
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
