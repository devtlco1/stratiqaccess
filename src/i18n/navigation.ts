import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link/useRouter/usePathname/redirect — these know the current
// locale prefix (or lack of one for English) so navigation and the language
// switcher can preserve the current page across locales.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
