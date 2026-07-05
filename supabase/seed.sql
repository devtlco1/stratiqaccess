-- =====================================================================
-- STRATIQ Access — seed data
-- Run after schema.sql. Safe to re-run (upserts on natural keys).
-- =====================================================================

insert into site_settings (id, site_name, tagline, legal_footer, legal_footer_extended, disclosure_notice, contact_email)
values (
  1,
  'STRATIQ Access',
  'Your Strategic Access to Iraq.',
  'STRATIQ Access is a commercial division operated by Abraj Al-Anwar for General Trading, General Contracting & Commercial Agencies LLC, Iraq.',
  'STRATIQ Access is a commercial division operated by Abraj Al-Anwar for General Trading, General Contracting & Commercial Agencies LLC, Iraq. All engagements, representation mandates, advisory services, tender intelligence support, and commercial coordination activities are subject to written agreement, applicable Iraqi laws, and appropriate confidentiality and non-circumvention protections.',
  'Detailed opportunity disclosure is subject to NDA, non-circumvention, and engagement approval.',
  'partners@stratiqaccess.com'
)
on conflict (id) do update set
  site_name = excluded.site_name,
  tagline = excluded.tagline,
  legal_footer = excluded.legal_footer,
  legal_footer_extended = excluded.legal_footer_extended,
  disclosure_notice = excluded.disclosure_notice,
  contact_email = excluded.contact_email;

insert into pages (slug, title, status) values
  ('home', 'Home', 'published'),
  ('about', 'About', 'published'),
  ('services', 'Services', 'published'),
  ('sectors', 'Sectors', 'published'),
  ('iraq-market-access', 'Iraq Market Access', 'published'),
  ('tender-intelligence', 'Tender Intelligence', 'published'),
  ('partnerships', 'Partnerships', 'published'),
  ('insights', 'Insights', 'published'),
  ('contact', 'Contact', 'published')
on conflict (slug) do nothing;

insert into languages (code, name, is_rtl, is_active, sort_order) values
  ('en', 'English', false, true, 0),
  ('ar', 'Arabic', true, false, 1),
  ('tr', 'Turkish', false, false, 2),
  ('ku', 'Kurdish (Sorani)', true, false, 3),
  ('zh', 'Simplified Chinese', false, false, 4),
  ('fa', 'Persian', true, false, 5)
on conflict (code) do nothing;

insert into services (slug, title, summary, sort_order, featured, status) values
  ('market-entry-advisory', 'Market Entry Advisory', 'We help international companies assess Iraq''s market potential, identify entry pathways, understand local requirements, and structure a practical market-entry plan.', 1, true, 'published'),
  ('tender-intelligence', 'Tender Intelligence', 'We monitor, qualify, and brief clients on relevant public and enterprise tender opportunities across strategic Iraqi sectors.', 2, true, 'published'),
  ('local-representation', 'Local Representation', 'We support selected international companies as their Iraq-facing commercial and coordination representative, subject to formal mandate and agreement.', 3, true, 'published'),
  ('procurement-sourcing-support', 'Procurement & Sourcing Support', 'We assist with local sourcing, supplier coordination, price intelligence, documentation support, and procurement follow-up.', 4, false, 'published'),
  ('partnership-jv-development', 'Partnership & JV Development', 'We identify and support structured partnerships, joint ventures, agency models, and local execution relationships.', 5, false, 'published'),
  ('delegation-meeting-support', 'Delegation & Meeting Support', 'We coordinate business visits, meeting agendas, local introductions, translation support, and delegation logistics.', 6, false, 'published')
on conflict (slug) do nothing;

insert into sectors (slug, title, sort_order, featured, status) values
  ('energy-power', 'Energy & Power Infrastructure', 1, true, 'published'),
  ('smart-metering', 'Smart Metering, AMI, HES & MDM Systems', 2, true, 'published'),
  ('solar-renewables', 'Solar & Renewable Energy', 3, true, 'published'),
  ('ict-digital', 'ICT & Digital Transformation', 4, false, 'published'),
  ('telecom', 'Telecom & Connectivity', 5, false, 'published'),
  ('data-centers', 'Data Centers & Enterprise Infrastructure', 6, false, 'published'),
  ('epc-infrastructure', 'EPC & Infrastructure', 7, false, 'published'),
  ('industrial-equipment', 'Industrial Equipment & Technical Supply', 8, false, 'published'),
  ('government-tenders', 'Government & Enterprise Tenders', 9, false, 'published')
on conflict (slug) do nothing;

-- Sample opportunities (published, free-preview) so the /tenders page has
-- real content to render before any admin data entry happens.
insert into opportunities (kind, title, sector_id, buyer, location, country, deadline, status, tender_type, summary, tags, is_free_preview, requires_nda, featured, content_status)
select
  'tender',
  'Advanced Metering Infrastructure — Regional Rollout',
  (select id from sectors where slug = 'smart-metering'),
  'Confidential — Government Utility',
  'Baghdad Governorate',
  'Iraq',
  current_date + interval '45 days',
  'open',
  'Public Tender',
  'Multi-phase AMI deployment covering residential and commercial metering points, including HES/MDM integration.',
  array['AMI', 'Smart Metering', 'Utilities'],
  true,
  true,
  true,
  'published'
where not exists (
  select 1 from opportunities where title = 'Advanced Metering Infrastructure — Regional Rollout'
);

insert into opportunities (kind, title, sector_id, buyer, location, country, deadline, status, tender_type, summary, tags, is_free_preview, requires_nda, featured, content_status)
select
  'tender',
  'Solar Power Plant — Independent Power Producer Opportunity',
  (select id from sectors where slug = 'solar-renewables'),
  'Confidential — State-Owned Enterprise',
  'Southern Iraq',
  'Iraq',
  current_date + interval '60 days',
  'open',
  'IPP / EPC',
  'Utility-scale solar development opportunity under Iraq''s renewable energy investment framework.',
  array['Solar', 'IPP', 'Renewable Energy'],
  true,
  true,
  true,
  'published'
where not exists (
  select 1 from opportunities where title = 'Solar Power Plant — Independent Power Producer Opportunity'
);

insert into opportunities (kind, title, sector_id, buyer, location, country, deadline, status, tender_type, summary, tags, is_free_preview, requires_nda, featured, content_status)
select
  'investment',
  'Data Center Co-Location Investment — Baghdad',
  (select id from sectors where slug = 'data-centers'),
  'Confidential — Private Sector',
  'Baghdad',
  'Iraq',
  null,
  'under_review',
  'Investment Opportunity',
  'Structured investment opportunity in enterprise-grade data center capacity to serve Iraq''s growing digital infrastructure demand.',
  array['Data Centers', 'Investment', 'Digital Infrastructure'],
  true,
  true,
  false,
  'published'
where not exists (
  select 1 from opportunities where title = 'Data Center Co-Location Investment — Baghdad'
);
