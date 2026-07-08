// EDIT ME: core brand facts used across the whole site (header, footer, contact, metadata)
// Visible copy (tagline, hero text, descriptions) lives in
// src/messages/{locale}/*.ts instead — these are locale-invariant brand facts.
export const siteConfig = {
  name: "STRATIQ Access",
  shortName: "STRATIQ",
  url: "https://stratiqaccess.com",
  email: "partners@stratiqaccess.com",
  logo: {
    // The STRATIQ Access lockup (gold panel + ivory text) carries its own
    // background panel, so the same transparent SVG reads correctly on both
    // light (header) and dark (footer) surfaces.
    dark: "/brand/stratiq-logo.svg", // used on light backgrounds (header)
    light: "/brand/stratiq-logo.svg", // used on dark backgrounds (footer, hero)
  },
  hero: {
    primaryCtaHref: "/contact",
    secondaryCtaHref: "/services",
  },
} as const;
