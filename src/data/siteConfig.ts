// EDIT ME: core brand facts used across the whole site (header, footer, contact, metadata)
export const siteConfig = {
  name: "STRATIQ Access",
  shortName: "STRATIQ",
  tagline: "Your trusted ground operations, logistics, and local network partner in Iraq.",
  description:
    "STRATIQ Access provides ground operations, logistics, staffing, legal coordination, secure accommodation, transportation, permits, events, and local network support for international companies operating in Iraq.",
  url: "https://stratiqaccess.com",
  email: "partners@stratiqaccess.com",
  location: "Baghdad, Iraq",
  logo: {
    // EDIT ME: swap these for the final vector logo files when ready
    dark: "/images/logo-navy.svg", // used on light backgrounds (header)
    light: "/images/logo-white.svg", // used on dark backgrounds (footer, hero)
  },
  // EDIT ME: homepage hero copy + calls to action
  hero: {
    title: "Your Ground Operations Partner in Iraq",
    subtitle:
      "STRATIQ Access supports international companies with secure logistics, local networks, staffing, legal coordination, accommodation, transport, permits, events, and on-the-ground execution across Iraq.",
    primaryCta: { label: "Plan Your Iraq Operations", href: "/contact" },
    secondaryCta: { label: "Explore Our Services", href: "/services" },
  },
} as const;
