import type { Locale } from "@/i18n/config";

// Picks the Arabic value when on the Arabic locale and a translation
// actually exists, otherwise falls back to English — so CMS rows that
// haven't been translated yet still render correctly on /ar.
export function pickText(locale: Locale, en: string, ar: string | null | undefined): string {
  return locale === "ar" && ar ? ar : en;
}

export function pickList<T>(locale: Locale, en: T[], ar: T[] | null | undefined): T[] {
  return locale === "ar" && ar && ar.length > 0 ? ar : en;
}
