import { siteConfig } from "@/data/siteConfig";
import { routing } from "./routing";
import type { Locale } from "./config";

// Builds the `alternates` metadata block (canonical + hreflang) for a given
// locale-agnostic pathname, e.g. "/" or "/services". English is unprefixed
// (the default locale), Arabic is prefixed with /ar — matching routing.ts.
export function buildAlternates(pathname: string, locale: Locale) {
  const languages: Record<string, string> = {};

  for (const loc of routing.locales) {
    const prefix = loc === routing.defaultLocale ? "" : `/${loc}`;
    const path = pathname === "/" ? prefix || "/" : `${prefix}${pathname}`;
    languages[loc] = `${siteConfig.url}${path}`;
  }

  return {
    canonical: languages[locale],
    languages: { ...languages, "x-default": languages[routing.defaultLocale] },
  };
}
