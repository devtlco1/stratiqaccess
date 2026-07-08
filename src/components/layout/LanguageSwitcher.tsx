"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";

// A dropdown rather than an inline toggle — scales cleanly as more locales
// are added to src/i18n/config.ts without redesigning the header.
// Preserves the current page across locales — /services <-> /ar/services —
// via next-intl's locale-aware router/pathname (see src/i18n/navigation.ts).
export function LanguageSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");

  return (
    <select
      aria-label={t("language")}
      value={locale}
      onChange={(event) => {
        router.replace(pathname, { locale: event.target.value as Locale });
        onNavigate?.();
      }}
      className="cursor-pointer rounded-md border border-navy/15 bg-white px-2.5 py-1.5 text-sm font-semibold text-ink/70 transition-colors hover:text-navy hover:border-navy/25 focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
    >
      {locales.map((code) => (
        <option key={code} value={code}>
          {localeNames[code]}
        </option>
      ))}
    </select>
  );
}
