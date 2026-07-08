// EDIT ME: core brand facts used across the whole site (header, footer, contact, metadata)
// Visible copy (tagline, hero text, descriptions) lives in
// src/messages/{locale}/*.ts instead — these are locale-invariant brand facts.
export const siteConfig = {
  name: "STRATIQ Access",
  shortName: "STRATIQ",
  url: "https://stratiqaccess.com",
  email: "partners@stratiqaccess.com",
  logo: {
    // Per STRATIQ_Access_logo_pack/STRATIQ_brand_colors.txt: blue logo on
    // light backgrounds, white logo on navy/dark backgrounds.
    dark: "/brand/stratiq-logo-blue.svg", // used on light backgrounds (header, admin)
    light: "/brand/stratiq-logo-white.svg", // used on dark backgrounds (footer)
  },
  hero: {
    primaryCtaHref: "/contact",
    secondaryCtaHref: "/services",
  },
} as const;
