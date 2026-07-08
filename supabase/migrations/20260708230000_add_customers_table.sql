-- Adds the "customers" table powering the /admin/customers simple CRM tab.
-- Leads/customers are admin-only data (never surfaced on the public site),
-- so unlike clients/services this table has no "public read" policy.
--
-- source_message_id optionally links a customer back to the inbox message
-- it was created from (via "Add to Customers" on /admin/messages).

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text,
  phone text,
  source text,
  status text not null default 'New'
    check (status in ('New', 'Contacted', 'Qualified', 'In Progress', 'Won', 'Lost')),
  notes text,
  source_message_id uuid references public.messages(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_status_idx on public.customers (status);
create index if not exists customers_created_at_idx on public.customers (created_at desc);

drop trigger if exists set_updated_at on public.customers;
create trigger set_updated_at
  before update on public.customers
  for each row
  execute function public.set_updated_at();

alter table public.customers enable row level security;

drop policy if exists "admin all" on public.customers;
create policy "admin all"
  on public.customers
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
