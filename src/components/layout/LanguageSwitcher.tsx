"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/config";
import { Icon } from "@/components/ui/Icon";

// Renders as a normal nav tab (same classes as a Services-style item in
// HeaderClient) rather than a separate pill button. Shares the parent's
// openDropdown state so only one dropdown (Services or Language) is ever
// open at a time, exactly like the rest of the nav.
// Preserves the current page across locales — /services <-> /ar/services —
// via next-intl's locale-aware router/pathname (see src/i18n/navigation.ts).
export function LanguageNavItem({
  isOpen,
  onOpen,
  onClose,
}: {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");

  function selectLocale(code: Locale) {
    onClose();
    if (code !== locale) router.replace(pathname, { locale: code });
  }

  return (
    <div className="relative group" onMouseEnter={onOpen} onMouseLeave={onClose}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="relative flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wide text-ink hover:text-stratiq-blue transition-colors after:absolute after:bottom-1 after:start-4 after:h-px after:w-0 after:bg-stratiq-blue after:transition-all after:duration-300 hover:after:w-[calc(100%-2rem)]"
      >
        {t("language")}
        <Icon name="chevron-down" className="size-3.5 transition-transform duration-300 group-hover:rotate-180" />
      </button>

      <div
        className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 transition-all duration-200 ${
          isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
        }`}
      >
        <div role="listbox" className="w-40 rounded-xl bg-white shadow-[0_20px_50px_rgba(24,32,51,0.15)] ring-1 ring-navy/5 overflow-hidden">
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              role="option"
              aria-selected={locale === code}
              onClick={() => selectLocale(code)}
              className={`block w-full px-5 py-3 text-start text-sm transition-all duration-200 border-b border-navy/5 last:border-b-0 ${
                locale === code
                  ? "bg-paper text-stratiq-blue font-semibold"
                  : "text-ink/80 hover:bg-paper hover:text-stratiq-blue hover:ps-6"
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

export function MobileLanguageNavItem({ onNavigate }: { onNavigate: () => void }) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");
  const [open, setOpen] = useState(false);

  function selectLocale(code: Locale) {
    setOpen(false);
    onNavigate();
    if (code !== locale) router.replace(pathname, { locale: code });
  }

  return (
    <div className="border-b border-navy/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3 text-base font-medium text-ink"
      >
        {t("language")}
        <Icon name="chevron-down" className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="pb-3 ps-4 flex flex-col gap-1">
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => selectLocale(code)}
              className={`py-2 text-start text-sm ${locale === code ? "text-stratiq-blue font-semibold" : "text-ink/70"}`}
            >
              {localeNames[code]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
