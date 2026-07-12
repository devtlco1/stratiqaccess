# Email Center

Admin-only email marketing/support module at `/admin/email-center`, integrated with **Hostinger Agentic Mail** for `partners@stratiqaccess.com` via their REST API (`https://api.mail.hostinger.com`, OpenAPI spec `v1.0.2`).

## Architecture

- **Everything server-side.** No Hostinger API token, webhook secret, cron secret, or Supabase service-role key is ever sent to the browser. All Hostinger API calls happen inside Server Actions or the three route handlers below.
- **Server Actions are the default** for all admin CRUD (contacts, templates, attachments, campaigns, inbox), matching this codebase's existing convention. **Three route handlers exist** because Server Actions can't serve unauthenticated public traffic:
  - `POST /api/webhooks/hostinger-email` — receives Hostinger's `message.received` event.
  - `POST /api/cron/email-queue` — driven by a Hostinger Cron Job, processes one batch of the send queue per invocation.
  - `POST /api/email/unsubscribe` — public one-click unsubscribe confirmation.
  - A fourth route, `GET /admin/email-center/contacts/export`, exists only because Server Actions can't return a file download with `Content-Disposition` headers — it's still admin-authenticated via the existing `/admin` middleware.
- **Two Supabase clients:**
  - `lib/supabase/server.ts` (existing, cookie-bound, RLS-scoped) — used by every admin page/Server Action, exactly like the rest of the admin dashboard.
  - `lib/supabase/service-role.ts` (new) — bypasses RLS, used **only** by the webhook, cron, and unsubscribe routes, which have no admin browser session for RLS to check against. Each of those routes enforces its own authorization independently (Bearer secret compare or signed token) — RLS is not a factor on those paths.
- **Hostinger API client** (`lib/hostinger/`): a typed wrapper (`client.ts`) with centralized Bearer auth, `AbortSignal.timeout`, exponential-backoff retry on `429`/`502`/`503`/`504` only, and response-envelope unwrapping. Per-resource modules: `mailbox.ts`, `folders.ts`, `messages.ts`, `send.ts`, `webhooks.ts`. Types in `types.ts` mirror the real OpenAPI schemas — nothing was guessed.

## Real Hostinger API limitations (read this before changing send/reply/thread logic)

These are not implementation gaps — they are hard limits of the Hostinger Mail API v1.0.2 as published, confirmed against the actual OpenAPI spec:

1. **`POST /send` returns `204 No Content` — no message ID.** There is no way to learn the Hostinger `uid`/`messageId` of a just-sent email from the send call itself. `lib/hostinger/send.ts#reconcileSentMessage()` does a best-effort search of the Sent folder by recipient + subject + time window afterward; it can fail to find a match (IMAP append lag) and that's expected — it's optional metadata, never a precondition for "sent" status.
2. **No `In-Reply-To`/`References`/custom-header field on send, and no dedicated reply/forward endpoint.** Every reply, forward, or campaign send is a fresh `POST /send` call. **This means outbound mail from this app does not carry real RFC5322 threading headers** — a reply will not show up threaded in the recipient's own Gmail/Outlook. `email_threads` in this app is an **internal dashboard grouping only** (by contact email + normalized subject + a freshness window, refined by `messageId`/`inReplyTo` when reading inbound mail). This is surfaced directly in the Reply/Reply All/Forward UI (`ComposeReplyForm.tsx`) so admins aren't surprised.
3. **The webhook payload body is undocumented.** The OpenAPI spec confirms the webhook is a `POST` with `Authorization: Bearer <secret>` for event `message.received`, but does not define the JSON body shape at all (no `callbacks` in the spec). The webhook handler (`src/app/api/webhooks/hostinger-email/route.ts`) treats it as a **trigger only**: verify the token, store the raw body verbatim (as `text`, not `jsonb`, since the shape is unknown), then resolve the actual new message by calling the documented `GET .../messages/{uid}` or `GET .../folders/{folder}/messages` endpoints. Never trust unparsed webhook fields for message content.
4. **No documented attachment/message size limit.** The 25MB default in Settings is an app-chosen safety threshold, not a Hostinger fact — labeled as such everywhere it appears in the UI.
5. **Rate limits are undocumented beyond "429 + possible temporary IP block."** The queue processor treats repeated `429`s within one campaign's batch as a signal to auto-pause that campaign (`email_campaigns.status = 'paused'`) rather than continuing to hammer the API.

## Database schema

Two migrations, in `supabase/migrations/`:

- `20260711120000_email_center_core_schema.sql` — 14 tables: `email_contacts`, `email_contact_lists`, `email_contact_list_members`, `email_templates`, `email_attachments`, `email_template_attachments`, `email_campaigns`, `email_threads`, `email_campaign_recipients`, `email_messages`, `email_webhook_events`, `email_suppression_list`, `email_settings`, `email_activity_logs`. All admin-only RLS (`auth.role() = 'authenticated'`), matching this project's existing `customers` table pattern — no per-role permission system exists or was introduced.
- `20260711120100_email_attachments_bucket.sql` — creates the private `email-attachments` Supabase Storage bucket + admin-only `storage.objects` policies (unlike `media`/`rfp-files`, created via migration for reproducibility rather than the dashboard).
- `20260711130000_email_queue_claim_function.sql` — two Postgres functions: `claim_campaign_recipients()` (the atomic batch claim, see below) and `fail_stuck_sending_recipients()` (stale-lock sweep).

Key design decisions:
- `email_campaigns.subject_snapshot`/`html_snapshot`/`text_snapshot` are copied from the template **at campaign creation**, not read live — editing a template never changes an in-flight or already-sent campaign.
- `email_campaign_recipients` has a **hard `unique(campaign_id, contact_id)` constraint** — the real, DB-level guarantee that the same campaign can never email the same contact twice, independent of any application logic.
- `email_messages` has a **hard `unique(folder, hostinger_uid)` constraint** — the real dedup backstop for inbound sync, independent of whatever the webhook payload does or doesn't contain. (Both this and the webhook-event dedup index are deliberately **full**, not partial/`WHERE ... IS NOT NULL`, indexes — a partial index can't be used as the arbiter for a plain `ON CONFLICT (col)` upsert from the Supabase client, and standard SQL unique semantics already let multiple `NULL` rows coexist without a partial predicate.)
- `email_suppression_list` has `unique(email_normalized)` with an `is_active` flag — "restoring" a suppressed contact flips `is_active = false` rather than deleting the row, keeping the suppression history.

## Hostinger API integration

`lib/hostinger/` covers every endpoint this app uses: `getCurrentAccount`/`getMailboxResourceId` (mailbox resource ID resolution + caching in `email_settings`), `getQuota`, `listFolders`/`createFolder`/`updateFolder`/`deleteFolder`, `listMessages`/`getMessage`/`getMessageText`/`getMessageSource`/`searchMessages`/`getMessageAttachment`, `updateMessageFlags`/`bulkUpdateMessageFlags` (read/unread), `moveMessage`/`bulkMoveMessages`, `deleteMessage`/`bulkDeleteMessages`, `sendEmail`, `listWebhooks`/`createWebhook`/`getWebhook`/`updateWebhook`/`deleteWebhook`/`regenerateWebhookSecret`/`testWebhook`.

## Environment variables

Add to `.env.local` (never commit; `.env.example` has been updated with placeholders):

```
SUPABASE_SERVICE_ROLE_KEY=       # Supabase dashboard > Project Settings > API > service_role secret
HOSTINGER_MAIL_API_TOKEN=        # hPanel > Emails > partners@stratiqaccess.com > API tokens (scope to this mailbox if your plan supports it)
HOSTINGER_MAILBOX=partners@stratiqaccess.com
HOSTINGER_MAIL_API_BASE_URL=https://api.mail.hostinger.com
HOSTINGER_WEBHOOK_SECRET=        # set after registering the webhook from Settings — see below
EMAIL_CRON_SECRET=                # openssl rand -hex 32
UNSUBSCRIBE_TOKEN_SECRET=         # openssl rand -hex 32
```

`NEXT_PUBLIC_SITE_URL` already existed and is reused for the webhook URL and unsubscribe links. No new `NEXT_PUBLIC_` variables were added.

**Where to set these in production (Hostinger):** hPanel → your Node.js application → **Environment variables** (or the `.env` file the Node app reads, depending on your Hostinger plan's Node hosting UI — check under "Website" → your Node app → "Manage" → environment configuration). Set each variable there, then restart the Node process for it to pick up the new values. Do not put these in any file committed to Git.

## Webhook

**Production URL:** `https://stratiqaccess.com/api/webhooks/hostinger-email`

Setup:
1. Go to `/admin/email-center/settings`, click **Register / Rotate Webhook**. This calls `POST /mailboxes/{id}/webhooks` (or regenerates the secret if one already exists at this URL) pointed at the URL above with event `message.received`.
2. The response includes a **one-time secret** — copy it immediately into `HOSTINGER_WEBHOOK_SECRET` in your Hostinger Node app's environment variables and restart the app. It is never stored in the database and never shown again.
3. Confirm via the same Settings page: "Webhook registered on Hostinger" should read OK, and "Last webhook received" will populate the next time an email arrives.

Verification: `GET https://stratiqaccess.com/api/webhooks/hostinger-email` should return `{"ok":true,"route":"hostinger-email-webhook"}` (no secret required — this is a bare reachability probe). A `POST` without a valid `Authorization: Bearer <secret>` header returns `401`.

Authentication is a **timing-safe** comparison (`crypto.timingSafeEqual`, `lib/email/bearerAuth.ts`) — never a plain `===` string compare.

## Cron / bulk-send queue

**Endpoint:** `POST https://stratiqaccess.com/api/cron/email-queue`, header `Authorization: Bearer <EMAIL_CRON_SECRET>`.

**Hostinger Cron Job setup** (hPanel → Advanced → Cron Jobs):
- Command: `curl -s -X POST -H "Authorization: Bearer <EMAIL_CRON_SECRET>" https://stratiqaccess.com/api/cron/email-queue`
- Interval: every 2 minutes (matches the default `send_interval_seconds` in Settings; both are independently configurable there without redeploying).
- Each invocation processes **at most one batch per active campaign** (default 20 recipients) and returns — it does not loop internally, so cron cadence directly controls throughput.

**Idempotency (the actual mechanism, not just a description):** `claim_campaign_recipients()` (Postgres function, `SECURITY DEFINER`) uses `FOR UPDATE SKIP LOCKED` inside a `WITH candidates AS (...) UPDATE ... FROM candidates` — two concurrent invocations of this function (e.g. overlapping cron runs) can never claim overlapping rows, because the second invocation's row selection skips anything the first has already locked, even before the first commits. This is verified by a live integration test (`src/lib/email/queueClaim.integration.test.ts`) that runs two real concurrent Postgres connections against the function and asserts zero overlap. The hard backstop beneath that is the `unique(campaign_id, contact_id)` constraint on `email_campaign_recipients` — even a bug in the claim logic could not cause a double-send past that constraint.

**Why stuck `"sending"` rows are never auto-retried:** because `send` returns `204` with no ID, there is no way to confirm after a crash whether a stuck send actually went out. `fail_stuck_sending_recipients()` marks anything stuck in `"sending"` for more than 15 minutes as `"failed"` with an explicit "manual review required" error — it is never silently reclaimed and resent. An admin must use "Retry Failed" after checking the Sent folder / recipient's inbox.

**Rate limiting:** the queue processor tracks `429` responses per campaign per batch; 3+ in one run auto-pauses that campaign (`status = 'paused'`) and logs the reason to Activity Logs.

## Template variables

Supported: `{{name}} {{first_name}} {{company}} {{email}} {{job_title}} {{sector}} {{country}} {{website}} {{sender_name}} {{unsubscribe_url}}`.

`{{first_name}}` is derived automatically from `{{name}}` (first whitespace-separated token) — there is no separate `first_name` column, matching the contact field list as specified.

`lib/email/templateVariables.ts#renderTemplate()` is the single source of truth for personalization: a variable with no value **and no configured fallback** is left as the literal `{{variable}}` string in the output and reported in `missingVariables` — callers (template test-send, campaign test-send, the queue processor) all check this and **block sending** when it's non-empty. A fallback (e.g. "Sir/Madam") is only applied when explicitly configured per-variable and is separately reported in `fallbacksUsed` as a non-blocking warning, never silently.

## Attachments

Private Supabase Storage bucket `email-attachments`. Upload validation (`lib/email/attachmentValidation.ts`) is **allowlist-based** (safer default than a blocklist): `pdf, doc, docx, xls, xlsx, ppt, pptx, csv, txt, rtf, jpg, jpeg, png, gif, webp`, checked against both file extension and MIME type. No documented Hostinger size limit exists, so the 25MB default in Settings is an app-chosen, admin-configurable warning threshold, checked both at upload time and again at actual send time (`lib/email/campaignAttachments.ts`) — a campaign whose combined template + campaign attachments exceed the limit fails those recipients with an explicit reason rather than silently truncating.

Three attachment scopes, matching the spec:
1. Reusable library (`email_attachments`).
2. Permanently linked to a template (`email_template_attachments`) — sent with every campaign using that template.
3. Campaign-only (`email_campaigns.attachment_ids`) or attached ad hoc to a single reply/compose.

## Contact importing

`/admin/email-center/contacts/import` — CSV, XLSX (via `exceljs`, not the `xlsx`/SheetJS npm package, which carries unpatched high-severity advisories on npm), pasted text, or a bridge from the existing `customers`/`messages` tables. All four sources funnel through the same pure `categorizeImportRows()` (`lib/email/contactImport.ts`), which classifies every row as `add` / `update` / `skip_duplicate_in_file` / `reject_invalid_email` / `reject_missing_email` **before** anything is written — the preview step shown to the admin is generated by literally the same function that performs the commit, so what's previewed is what happens. Deduplication is against `email_contacts.email_normalized` (a generated, always-lowercase-trimmed column with a unique index).

## Campaign sending

One individually personalized `POST /send` call per recipient — never a shared To/Cc/Bcc list (`lib/email/queueProcessor.ts`). The 9-step wizard (name/description → recipients → template → subject/body override → attachments → preview 5+ contacts → test send → confirmation summary → explicit confirm-to-queue) is implemented as sections on one campaign detail page (`/admin/email-center/campaigns/[id]`) rather than nine separate routes — this matches the existing codebase's one-page-per-entity convention (see `customers`, `services`) more closely than a literal multi-page wizard would, while still requiring every step's data (recipients synced, template chosen, content saved, test sent) before the final confirm button is meaningful.

Suppression is checked **twice**: once when recipients are synced into `email_campaign_recipients` (marks them `status = 'suppressed'` immediately, they're never queued) and again by the queue processor immediately before every actual `send` call, so a suppression added after a campaign was queued still takes effect.

## Inbox synchronization

The inbox reads folders/messages **live** from the Hostinger API (`listFolders`, `listMessages`, `searchMessages`, `getMessage`) rather than only from a local cache — so historical mail (sent before this app existed) and mail sent from any other client both show up correctly. Opening a message (`inbox/open`) or an inbound webhook event both funnel through the same `syncInboundMessage()` (`lib/email/inboxSync.ts`), which is idempotent (the `unique(folder, hostinger_uid)` constraint) and also flips any matching `email_campaign_recipients.status` to `"replied"` when the sender matches a contact with an active/recent campaign.

## Suppression rules

`email_suppression_list`, one row per normalized email, `is_active` flag (not a delete) so restoring keeps history. Reasons: `unsubscribed | bounced_hard | bounced_soft | complaint | manual | invalid`. The unsubscribe link (`{{unsubscribe_url}}`) is an HMAC-signed, opaque token (`lib/email/unsubscribeToken.ts`, `UNSUBSCRIBE_TOKEN_SECRET`) — no login required to unsubscribe, and no raw contact ID appears in the URL. The public landing page (`/unsubscribe`) requires an explicit confirm click (`POST /api/email/unsubscribe`) rather than unsubscribing on the bare `GET` — this follows the standard practice of not letting mail-client link-prefetching trigger an accidental unsubscribe.

## Security controls

- Admin-only: every `/admin/email-center/**` page/action is covered by the existing `adminMiddleware` (Supabase Auth session check) — no new auth system.
- RLS on every new table, service-role client scoped to exactly three route handlers.
- `crypto.timingSafeEqual` for both the webhook secret and (indirectly, via HMAC verification) the unsubscribe token.
- HTML sanitized both directions: `sanitizeComposedHtml()` for anything an admin writes and sends, `sanitizeReceivedHtml()` for anything rendered from inbound mail (`lib/email/sanitizeHtml.ts`, built on `sanitize-html`, allowlist-based).
- File upload validated by extension + MIME allowlist + size cap before it ever reaches Storage.
- No secrets in `email_settings` (checked explicitly — it's a plain key/value table any authenticated dashboard user can read) or in Activity Logs (`lib/email/activityLog.ts` truncates subject fields and never logs bodies).
- The Settings page shows presence/validity only — `!!process.env.HOSTINGER_MAIL_API_TOKEN`, never the value itself. The one time a real secret is shown in the UI is the webhook secret, immediately after creation/rotation, exactly once, with an explicit "copy now" instruction — it is not persisted anywhere.

## Troubleshooting

- **"HOSTINGER_MAIL_API_TOKEN is not configured"** — check the env var is set in the Hostinger Node app's environment (not just `.env.local` for local dev) and the process was restarted after setting it.
- **Settings → Connection Health shows an error** — click "Test Connection"; the error message includes the Hostinger error `code` (never the token). Common cause: `HOSTINGER_MAILBOX` doesn't exactly match one of the addresses the API token is scoped to (`GET /api/v1/me` lists what the token can see).
- **Webhook never fires / "Last webhook received" stays "never"** — confirm the webhook is `status: active` on Hostinger (Settings page shows this), confirm `HOSTINGER_WEBHOOK_SECRET` matches exactly what was shown at registration (it cannot be recovered — rotate if lost), and confirm the production URL is publicly reachable (`GET` the health-probe URL from outside your network).
- **A campaign is stuck at `"paused"` with no admin action** — check Activity Logs for `campaign.auto_paused_rate_limit`; this means the queue hit repeated `429`s from Hostinger. Wait a while before resuming.
- **A recipient is `"failed"` with `"Stuck in sending... manual review required"`** — the process may have restarted mid-send. Check the Sent folder / the recipient's actual inbox before using "Retry Failed," since this specific failure mode cannot distinguish "never sent" from "sent but not recorded."

## Rotating secrets

- **Hostinger API token:** revoke/regenerate in hPanel, update `HOSTINGER_MAIL_API_TOKEN`, restart the Node app. No app-side rotation flow needed — it's a single env var.
- **Webhook secret:** use "Register / Rotate Webhook" in Settings (calls Hostinger's `regenerate-secret` endpoint), copy the new secret into `HOSTINGER_WEBHOOK_SECRET`, restart the app. The old secret stops working immediately upon rotation — expect a short window where inbound webhook deliveries fail until both sides are updated.
- **`EMAIL_CRON_SECRET` / `UNSUBSCRIBE_TOKEN_SECRET`:** generate a new value (`openssl rand -hex 32`), update the env var and restart. Rotating `UNSUBSCRIBE_TOKEN_SECRET` invalidates every unsubscribe link already sent — only do this if you're prepared to re-send/regenerate them, or accept that old links show "no longer valid" (a contact can still be unsubscribed manually from `/admin/email-center/suppression`).
- **`SUPABASE_SERVICE_ROLE_KEY`:** rotate from the Supabase dashboard, update the env var, restart the app.

## Testing without sending a real campaign

- Template test-send and campaign test-send **only** accept an explicitly-typed administrator email address each time — there is no way to accidentally send to a real contact from either test-send button.
- A campaign cannot be queued without first choosing recipients, content, and (per the UI's own warning) sending at least one test — nothing here fully blocks queueing without a test send at the database level, so this is a UI nudge, not a hard constraint; treat the confirmation screen's counts as the actual safety check before clicking "Queue Campaign."
- Automated tests (`npm test`, Vitest) cover the pure logic paths without touching the live API: template variable replacement/missing-variable detection, contact dedup/import categorization, attachment validation, webhook bearer-token auth, unsubscribe token signing/verification, thread-subject normalization, and a **live** integration test against the real `claim_campaign_recipients()` Postgres function proving queue idempotency (creates and cleans up its own isolated test data — see `src/lib/email/queueClaim.integration.test.ts`).
- Live Hostinger API calls (send, inbox read, webhook registration) were exercised via `curl` against the auth/routing layer only, since no live `HOSTINGER_MAIL_API_TOKEN`/`SUPABASE_SERVICE_ROLE_KEY` were available at implementation time — see the final report for exactly what is and isn't live-verified.
