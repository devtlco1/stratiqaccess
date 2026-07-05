-- Adds reference numbering, government/private ownership, and a
-- 3-way procurement categorization (tender / contract / purchase
-- request) to opportunities, matching Iraq's official tender portal
-- structure (itp.iq).

create type ownership_type as enum ('government', 'private');
create type procurement_type as enum ('tender', 'contract', 'purchase_request');

alter table opportunities
  add column reference_no text,
  add column ownership ownership_type not null default 'government',
  add column procurement_type procurement_type not null default 'tender',
  add column published_at date not null default current_date;
