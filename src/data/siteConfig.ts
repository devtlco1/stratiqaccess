// EDIT ME: core brand facts used across the whole site (header, footer, contact, metadata)
// Visible copy (tagline, hero text, descriptions) lives in
// src/messages/{locale}/*.ts instead — these are locale-invariant brand facts.
export const siteConfig = {
  name: "STRATIQ Access",
  shortName: "STRATIQ",
  url: "https://stratiqaccess.com",
  email: "partners@stratiqaccess.com",
  logo: {
    // EDIT ME: swap these for the final vector logo files when ready
    dark: "/images/logo-navy.svg", // used on light backgrounds (header)
    light: "/images/logo-white.svg", // used on dark backgrounds (footer, hero)
  },
  hero: {
    primaryCtaHref: "/contact",
    secondaryCtaHref: "/services",
  },
} as const;
