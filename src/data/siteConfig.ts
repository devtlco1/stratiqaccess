// EDIT ME: core brand facts used across the whole site (header, footer, contact, metadata)
export const siteConfig = {
  name: "STRATIQ Access",
  shortName: "STRATIQ",
  tagline: "Your Gateway to Iraq's Market, Tenders, and Strategic Partnerships.",
  description:
    "STRATIQ Access is an Iraq-based advisory and representation platform helping international companies enter, navigate, and grow in the Iraqi market.",
  url: "https://stratiqaccess.com",
  email: "partners@stratiqaccess.com",
  location: "Baghdad, Iraq",
  logo: {
    // EDIT ME: swap these for the final vector logo files when ready
    dark: "/images/logo-navy.svg", // used on light backgrounds (header)
    light: "/images/logo-white.svg", // used on dark backgrounds (footer, hero)
  },
} as const;
