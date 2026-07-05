import { defineRouting } from "next-intl/routing";

/**
 * Only English ships today. Adding a locale later is a one-line change here
 * plus a new messages/<locale>.json + rtlLocales entry — no route restructuring.
 */
export const locales = ["en"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
};

export const rtlLocales: Locale[] = [];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
});
