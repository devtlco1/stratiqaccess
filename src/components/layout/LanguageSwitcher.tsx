"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/config";

// Preserves the current page across locales — /services <-> /ar/services —
// via next-intl's locale-aware router/pathname (see src/i18n/navigation.ts).
export function LanguageSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");

  return (
    <div className="flex items-center gap-1 text-sm font-semibold tracking-wide" aria-label={t("language")}>
      {locales.map((code, i) => (
        <span key={code} className="flex items-center gap-1">
          {i > 0 && <span className="text-ink/25">/</span>}
          <button
            type="button"
            onClick={() => {
              router.replace(pathname, { locale: code });
              onNavigate?.();
            }}
            aria-current={locale === code}
            className={`px-1.5 py-1 uppercase transition-colors duration-200 ${
              locale === code ? "text-stratiq-blue" : "text-ink/50 hover:text-navy"
            }`}
          >
            {code}
          </button>
        </span>
      ))}
    </div>
  );
}
