-- Clears the admin-uploaded logo override (an unrelated "TLCO" test upload)
-- so the header/footer fall back to the new STRATIQ Access brand lockup
-- shipped at public/brand/stratiq-logo.svg (see src/data/siteConfig.ts).
update public.site_images set image_url = null where key in ('logo_left', 'logo_right');
