-- =====================================================================
-- STRATIQ Access — database schema
-- Run against a fresh Supabase project (SQL editor or `supabase db push`)
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------
create type user_role as enum ('admin', 'editor', 'client', 'visitor');
create type content_status as enum ('draft', 'published');
create type opportunity_kind as enum ('tender', 'investment');
create type opportunity_status as enum ('open', 'closed', 'under_review', 'awarded');
create type purchase_status as enum ('pending', 'approved', 'rejected');
create type payment_method as enum ('stripe', 'bank_transfer', 'fastpay', 'zaincash', 'manual');
create type lead_status as enum ('new', 'reviewed', 'archived');
create type nda_status as enum ('pending', 'approved', 'rejected');

-- ---------------------------------------------------------------------
-- Profiles (extends auth.users)
-- ---------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  role user_role not null default 'client',
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'client');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ---------------------------------------------------------------------
-- Site settings (singleton)
-- ---------------------------------------------------------------------
create table site_settings (
  id int primary key default 1,
  site_name text not null default 'STRATIQ Access',
  tagline text not null default 'Your Strategic Access to Iraq.',
  legal_footer text not null default 'STRATIQ Access is a commercial division operated by Abraj Al-Anwar for General Trading, General Contracting & Commercial Agencies LLC, Iraq.',
  legal_footer_extended text,
  disclosure_notice text not null default 'Detailed opportunity disclosure is subject to NDA, non-circumvention, and engagement approval.',
  contact_email text not null default 'partners@stratiqaccess.com',
  social_links jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  constraint singleton check (id = 1)
);

-- ---------------------------------------------------------------------
-- Languages / translations
-- ---------------------------------------------------------------------
create table languages (
  code text primary key,
  name text not null,
  is_rtl boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create table translations (
  id uuid primary key default gen_random_uuid(),
  namespace text not null,
  key text not null,
  locale text not null references languages (code),
  value text not null,
  updated_at timestamptz not null default now(),
  unique (namespace, key, locale)
);

-- ---------------------------------------------------------------------
-- Pages / sections (generic CMS content for public pages)
-- ---------------------------------------------------------------------
create table pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  seo_title text,
  seo_description text,
  status content_status not null default 'draft',
  updated_at timestamptz not null default now()
);

create table page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references pages (id) on delete cascade,
  key text not null,
  heading text,
  body text,
  sort_order int not null default 0,
  is_hidden boolean not null default false
);

-- ---------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------
create table services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  body text,
  icon text,
  sort_order int not null default 0,
  featured boolean not null default false,
  status content_status not null default 'published',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Sectors
-- ---------------------------------------------------------------------
create table sectors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  icon text,
  sort_order int not null default 0,
  featured boolean not null default false,
  status content_status not null default 'published',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Opportunities (tenders + investment opportunities share one table)
-- ---------------------------------------------------------------------
create table opportunities (
  id uuid primary key default gen_random_uuid(),
  kind opportunity_kind not null default 'tender',
  title text not null,
  sector_id uuid references sectors (id) on delete set null,
  buyer text,
  location text,
  country text default 'Iraq',
  deadline date,
  status opportunity_status not null default 'open',
  tender_type text,
  summary text not null,
  confidential_details text,
  tags text[] not null default '{}',
  price numeric(12, 2),
  is_free_preview boolean not null default true,
  requires_nda boolean not null default true,
  featured boolean not null default false,
  content_status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table opportunity_attachments (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities (id) on delete cascade,
  file_path text not null,
  file_name text not null,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table saved_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  opportunity_id uuid not null references opportunities (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

create table nda_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles (id) on delete set null,
  opportunity_id uuid not null references opportunities (id) on delete cascade,
  company_name text not null,
  email text not null,
  message text,
  status nda_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Paid reports (market/tender intelligence downloads)
-- ---------------------------------------------------------------------
create table reports (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  price numeric(12, 2) not null default 0,
  currency text not null default 'USD',
  file_path text,
  cover_image_path text,
  featured boolean not null default false,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles (id) on delete cascade,
  item_type text not null check (item_type in ('report', 'opportunity')),
  item_id uuid not null,
  amount numeric(12, 2) not null,
  currency text not null default 'USD',
  payment_method payment_method not null default 'manual',
  status purchase_status not null default 'pending',
  approved_by uuid references profiles (id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table downloads (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references purchases (id) on delete cascade,
  file_path text not null,
  download_count int not null default 0,
  last_downloaded_at timestamptz
);

-- ---------------------------------------------------------------------
-- Insights / articles
-- ---------------------------------------------------------------------
create table articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  body text,
  cover_image_path text,
  sector_id uuid references sectors (id) on delete set null,
  featured boolean not null default false,
  status content_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Leads (all contact / inquiry forms unify into one table, distinguished
-- by form_type — a contact submission IS a lead, so we don't duplicate)
-- ---------------------------------------------------------------------
create table leads (
  id uuid primary key default gen_random_uuid(),
  form_type text not null default 'general' check (
    form_type in ('general', 'market_entry', 'representation', 'partnership', 'tender_intelligence')
  ),
  company_name text,
  contact_person text,
  email text not null,
  country text,
  sector text,
  service_interest text,
  message text,
  attachment_path text,
  status lead_status not null default 'new',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Media library
-- ---------------------------------------------------------------------
create table media (
  id uuid primary key default gen_random_uuid(),
  file_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

-- =====================================================================
-- Row Level Security
-- =====================================================================

alter table profiles enable row level security;
alter table site_settings enable row level security;
alter table languages enable row level security;
alter table translations enable row level security;
alter table pages enable row level security;
alter table page_sections enable row level security;
alter table services enable row level security;
alter table sectors enable row level security;
alter table opportunities enable row level security;
alter table opportunity_attachments enable row level security;
alter table saved_opportunities enable row level security;
alter table nda_requests enable row level security;
alter table reports enable row level security;
alter table purchases enable row level security;
alter table downloads enable row level security;
alter table articles enable row level security;
alter table leads enable row level security;
alter table media enable row level security;

-- Helper: is the current user an admin or editor?
create function is_staff()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$ language sql stable security definer set search_path = public;

-- Profiles: users read their own row; staff read/manage all.
create policy "profiles_self_select" on profiles for select using (auth.uid() = id or is_staff());
create policy "profiles_staff_write" on profiles for all using (is_staff()) with check (is_staff());

-- Public-readable content tables (published only) + staff full access.
create policy "site_settings_public_read" on site_settings for select using (true);
create policy "site_settings_staff_write" on site_settings for all using (is_staff()) with check (is_staff());

create policy "languages_public_read" on languages for select using (true);
create policy "languages_staff_write" on languages for all using (is_staff()) with check (is_staff());

create policy "translations_public_read" on translations for select using (true);
create policy "translations_staff_write" on translations for all using (is_staff()) with check (is_staff());

create policy "pages_public_read" on pages for select using (status = 'published' or is_staff());
create policy "pages_staff_write" on pages for all using (is_staff()) with check (is_staff());

create policy "page_sections_public_read" on page_sections for select using (
  not is_hidden or is_staff()
);
create policy "page_sections_staff_write" on page_sections for all using (is_staff()) with check (is_staff());

create policy "services_public_read" on services for select using (status = 'published' or is_staff());
create policy "services_staff_write" on services for all using (is_staff()) with check (is_staff());

create policy "sectors_public_read" on sectors for select using (status = 'published' or is_staff());
create policy "sectors_staff_write" on sectors for all using (is_staff()) with check (is_staff());

create policy "opportunities_public_read" on opportunities for select using (
  content_status = 'published' or is_staff()
);
create policy "opportunities_staff_write" on opportunities for all using (is_staff()) with check (is_staff());

create policy "opportunity_attachments_public_read" on opportunity_attachments for select using (
  is_public or is_staff()
);
create policy "opportunity_attachments_staff_write" on opportunity_attachments for all using (is_staff()) with check (is_staff());

create policy "articles_public_read" on articles for select using (status = 'published' or is_staff());
create policy "articles_staff_write" on articles for all using (is_staff()) with check (is_staff());

-- Client-owned data.
create policy "saved_opportunities_owner" on saved_opportunities for all using (
  auth.uid() = user_id or is_staff()
) with check (auth.uid() = user_id or is_staff());

create policy "nda_requests_owner_insert" on nda_requests for insert with check (true);
create policy "nda_requests_owner_select" on nda_requests for select using (
  auth.uid() = user_id or is_staff()
);
create policy "nda_requests_staff_write" on nda_requests for update using (is_staff()) with check (is_staff());

create policy "purchases_owner_select" on purchases for select using (
  auth.uid() = user_id or is_staff()
);
create policy "purchases_owner_insert" on purchases for insert with check (auth.uid() = user_id);
create policy "purchases_staff_write" on purchases for update using (is_staff()) with check (is_staff());

create policy "downloads_owner_select" on downloads for select using (
  is_staff() or exists (
    select 1 from purchases
    where purchases.id = downloads.purchase_id
      and purchases.user_id = auth.uid()
      and purchases.status = 'approved'
  )
);
create policy "downloads_staff_write" on downloads for all using (is_staff()) with check (is_staff());

create policy "reports_public_read" on reports for select using (status = 'published' or is_staff());
create policy "reports_staff_write" on reports for all using (is_staff()) with check (is_staff());

-- Leads: anyone can submit an inquiry; only staff can read/manage them.
create policy "leads_public_insert" on leads for insert with check (true);
create policy "leads_staff_select" on leads for select using (is_staff());
create policy "leads_staff_write" on leads for update using (is_staff()) with check (is_staff());

create policy "media_public_read" on media for select using (true);
create policy "media_staff_write" on media for all using (is_staff()) with check (is_staff());

-- ---------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('public-media', 'public-media', true),
  ('reports', 'reports', false),
  ('attachments', 'attachments', false)
on conflict (id) do nothing;

create policy "public_media_read" on storage.objects for select using (bucket_id = 'public-media');
create policy "public_media_staff_write" on storage.objects for all using (
  bucket_id = 'public-media' and is_staff()
) with check (bucket_id = 'public-media' and is_staff());

create policy "reports_staff_only" on storage.objects for all using (
  bucket_id = 'reports' and is_staff()
) with check (bucket_id = 'reports' and is_staff());

create policy "attachments_staff_write" on storage.objects for all using (
  bucket_id = 'attachments' and is_staff()
) with check (bucket_id = 'attachments' and is_staff());
