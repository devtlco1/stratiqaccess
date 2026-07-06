import { defineRouting } from "next-intl/routing";

/**
 * English and Arabic ship today. Adding another locale later is a
 * one-line change here plus a new messages/<locale>.json entry (and an
 * rtlLocales entry if it's RTL) — no route restructuring.
 */
export const locales = ["en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};

export const rtlLocales: Locale[] = ["ar"];

export const routing = defineRouting({
  locales,
  defaultLocale: "en",
  localePrefix: "as-needed",
});
