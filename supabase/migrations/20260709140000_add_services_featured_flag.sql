-- Homepage should show only a curated set of "featured" services rather
-- than every row in the table (20 and growing). Adds is_featured and marks
-- the 6 SEO pillar pages from the phase-2 migration as the featured set —
-- /services itself is untouched and continues to show every row.

alter table public.services add column if not exists is_featured boolean not null default false;

update public.services set is_featured = true
where slug in (
  'iraq-market-entry-services',
  'local-representation-in-iraq',
  'tender-intelligence-iraq',
  'logistics-coordination-in-iraq',
  'business-development-support-iraq',
  'ground-operations-partner-in-iraq'
);
