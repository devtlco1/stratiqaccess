export type NavLink = {
  key: string;
  href: string;
};

export type NavItem = {
  key: string;
  href: string;
  dropdown?: NavLink[];
};

// Structure only (hrefs + dropdown nesting) — labels live in
// src/messages/{locale}/navigation.ts, keyed by `key` below, so the tree
// itself isn't duplicated per locale. Dropdown items link to their own
// dedicated /services/[slug] page.
export const mainNav: NavItem[] = [
  { key: "home", href: "/" },
  {
    key: "services",
    href: "/services",
    dropdown: [
      { key: "groundOperations", href: "/services/field-operations-support" },
      { key: "logisticsTransport", href: "/services/internal-transportation" },
      { key: "securityCoordination", href: "/services/private-security-coordination" },
      { key: "legalAdministrative", href: "/services/legal-advisory" },
      { key: "staffing", href: "/services/freelance-local-staffing" },
      { key: "events", href: "/services/event-management" },
      { key: "procurement", href: "/services/food-supply-procurement" },
    ],
  },
  { key: "clients", href: "/clients" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
];
