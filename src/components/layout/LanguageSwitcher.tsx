"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { Icon } from "@/components/ui/Icon";

// A custom dropdown (not a bare <select>) so it visually reads as a
// language picker and matches the site's own nav-dropdown styling.
// Scales cleanly as more locales are added to src/i18n/config.ts.
// Preserves the current page across locales — /services <-> /ar/services —
// via next-intl's locale-aware router/pathname (see src/i18n/navigation.ts).
export function LanguageSwitcher({ onNavigate }: { onNavigate?: () => void }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function selectLocale(code: Locale) {
    setOpen(false);
    if (code !== locale) router.replace(pathname, { locale: code });
    onNavigate?.();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("language")}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-navy/15 px-3.5 py-1.5 text-sm font-medium text-ink/70 transition-colors hover:border-stratiq-blue/40 hover:text-navy"
      >
        <Icon name="languages" className="size-4 text-stratiq-blue" />
        {localeNames[locale]}
        <Icon
          name="chevron-down"
          className={`size-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        role="listbox"
        className={`absolute end-0 top-full pt-2 z-50 transition-all duration-200 ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="w-40 rounded-xl bg-white shadow-[0_20px_50px_rgba(24,32,51,0.15)] ring-1 ring-navy/5 overflow-hidden">
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={locale === code}
              onClick={() => selectLocale(code)}
              className={`block w-full px-4 py-2.5 text-start text-sm transition-colors border-b border-navy/5 last:border-b-0 ${
                locale === code
                  ? "bg-paper text-stratiq-blue font-semibold"
                  : "text-ink/80 hover:bg-paper hover:text-stratiq-blue"
              }`}
            >
              {localeNames[code]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
