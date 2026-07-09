export type NavItem = {
  key: string;
  href: string;
  hasDropdown?: boolean;
};

// Structure only (hrefs) — labels live in src/messages/{locale}/navigation.ts,
// keyed by `key` below, so the tree itself isn't duplicated per locale.
// The "services" item's dropdown is populated at render time from the
// `services` table (see Header.tsx) so it always matches what's live on
// /services and in the admin dashboard, instead of a hardcoded list here.
export const mainNav: NavItem[] = [
  { key: "home", href: "/" },
  { key: "services", href: "/services", hasDropdown: true },
  { key: "clients", href: "/clients" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
];
