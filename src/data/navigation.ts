export type NavLink = {
  label: string;
  href: string;
};

export type NavItem = {
  label: string;
  href: string;
  dropdown?: NavLink[];
};

// EDIT ME: header nav labels/order. Dropdown items link to their own
// dedicated /sectors/[slug] or /services/[slug] page.
export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Sectors",
    href: "/sectors",
    dropdown: [
      { label: "Energy", href: "/sectors/energy" },
      { label: "Infrastructure", href: "/sectors/infrastructure" },
      { label: "Construction", href: "/sectors/construction" },
      { label: "Healthcare", href: "/sectors/healthcare" },
      { label: "ICT & Digital Transformation", href: "/sectors/ict" },
      { label: "Security & Defense Support", href: "/sectors/security" },
      { label: "Logistics & Supply Chain", href: "/sectors/logistics" },
    ],
  },
  {
    label: "Services",
    href: "/services",
    dropdown: [
      { label: "Market Entry", href: "/services/market-entry" },
      { label: "Tender Intelligence", href: "/services/tender-intelligence" },
      { label: "Local Representation", href: "/services/local-representation" },
      { label: "Partner Search", href: "/services/partner-search" },
      { label: "Government Liaison", href: "/services/government-liaison" },
      { label: "Feasibility & Market Research", href: "/services/feasibility-research" },
      { label: "Commercial Advisory", href: "/services/commercial-advisory" },
    ],
  },
  { label: "Case Studies", href: "/case-studies" },
  { label: "Insights", href: "/insights" },
  { label: "Contact", href: "/contact" },
];
