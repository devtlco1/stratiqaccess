-- Adds optional Arabic content columns to the four CMS-managed content
-- tables, so the /ar site can show native Arabic copy instead of falling
-- back to English. All columns are nullable and additive — existing rows
-- and the current English-only read path are unaffected until the app
-- code is updated to read them, and the app falls back to the English
-- column whenever an *_ar value is empty.

alter table public.services
  add column if not exists title_ar text,
  add column if not exists description_ar text,
  add column if not exists body_ar jsonb not null default '[]'::jsonb,
  add column if not exists highlights_ar jsonb not null default '[]'::jsonb;

alter table public.sectors
  add column if not exists title_ar text,
  add column if not exists description_ar text,
  add column if not exists body_ar jsonb not null default '[]'::jsonb,
  add column if not exists highlights_ar jsonb not null default '[]'::jsonb;

alter table public.case_studies
  add column if not exists title_ar text,
  add column if not exists sector_ar text,
  add column if not exists summary_ar text,
  add column if not exists body_ar jsonb not null default '[]'::jsonb;

alter table public.insights
  add column if not exists title_ar text,
  add column if not exists excerpt_ar text,
  add column if not exists body_ar jsonb not null default '[]'::jsonb;
