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
// dedicated /services/[slug] page.
export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Services",
    href: "/services",
    dropdown: [
      { label: "Ground Operations", href: "/services/field-operations-support" },
      { label: "Logistics & Transport", href: "/services/internal-transportation" },
      { label: "Security Coordination", href: "/services/private-security-coordination" },
      { label: "Legal & Administrative", href: "/services/legal-advisory" },
      { label: "Staffing", href: "/services/freelance-local-staffing" },
      { label: "Events", href: "/services/event-management" },
      { label: "Procurement", href: "/services/food-supply-procurement" },
    ],
  },
  { label: "Clients", href: "/clients" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
