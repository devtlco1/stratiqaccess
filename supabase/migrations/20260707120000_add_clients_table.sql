-- Adds the "clients" table powering the homepage "Our Clients" section and
-- the /admin/clients dashboard page.
--
-- Matches the exact conventions already used by services/sectors/case_studies:
-- the shared public.set_updated_at() trigger function, and an "admin write"
-- (ALL, authenticated) + "public read" (SELECT) policy pair. The one
-- difference from those tables is that clients has a publish/unpublish flag,
-- so "public read" is scoped to is_published = true instead of USING (true).

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website_url text,
  industry text,
  is_featured boolean not null default false,
  is_published boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clients_display_order_idx on public.clients (display_order);

drop trigger if exists set_updated_at on public.clients;
create trigger set_updated_at
  before update on public.clients
  for each row
  execute function public.set_updated_at();

alter table public.clients enable row level security;

drop policy if exists "admin write" on public.clients;
create policy "admin write"
  on public.clients
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

drop policy if exists "public read" on public.clients;
create policy "public read"
  on public.clients
  for select
  using (is_published = true);
