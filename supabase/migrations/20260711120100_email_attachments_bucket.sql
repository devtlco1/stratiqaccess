-- Creates the private "email-attachments" Supabase Storage bucket used by
-- the Email Center attachment library (Company Profile PDFs, brochures,
-- etc.) plus admin-only storage.objects policies scoped to that bucket.
--
-- Unlike "media" and "rfp-files" (created manually in the Supabase
-- dashboard, per existing project convention), this bucket is created here
-- via migration for reproducibility — insert into storage.buckets is a
-- documented, supported Supabase pattern and behaves identically to
-- creating it through the dashboard. storage.objects already has row level
-- security enabled by Supabase by default; we only add policies to it, we
-- do not (and must not) run "enable row level security" on it ourselves.
--
-- The campaign/reply send path reads attachment bytes via the service-role
-- client (to base64-encode them into the Hostinger send payload) and does
-- not depend on these policies at all. They exist so the admin dashboard's
-- authenticated browser session can list/preview/download attachments
-- directly, mirroring the "rfp-files" private-bucket + signed-URL pattern.

insert into storage.buckets (id, name, public)
values ('email-attachments', 'email-attachments', false)
on conflict (id) do nothing;

drop policy if exists "email attachments admin select" on storage.objects;
create policy "email attachments admin select"
  on storage.objects
  for select
  using (bucket_id = 'email-attachments' and auth.role() = 'authenticated');

drop policy if exists "email attachments admin insert" on storage.objects;
create policy "email attachments admin insert"
  on storage.objects
  for insert
  with check (bucket_id = 'email-attachments' and auth.role() = 'authenticated');

drop policy if exists "email attachments admin update" on storage.objects;
create policy "email attachments admin update"
  on storage.objects
  for update
  using (bucket_id = 'email-attachments' and auth.role() = 'authenticated');

drop policy if exists "email attachments admin delete" on storage.objects;
create policy "email attachments admin delete"
  on storage.objects
  for delete
  using (bucket_id = 'email-attachments' and auth.role() = 'authenticated');
