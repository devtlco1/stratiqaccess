"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/about", key: "about" },
  { href: "/services", key: "services" },
  { href: "/sectors", key: "sectors" },
  { href: "/iraq-market-access", key: "iraqMarketAccess" },
  { href: "/tender-intelligence", key: "tenderIntelligence" },
  { href: "/partnerships", key: "partnerships" },
  { href: "/insights", key: "insights" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-navy-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link href="/" className="font-display text-xl tracking-wide text-silver-100">
          STRATIQ <span className="text-gold-400">Access</span>
        </Link>

        <nav className="hidden items-center gap-8 xl:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm uppercase tracking-wide text-silver-300 transition-colors hover:text-gold-400",
                pathname === link.href && "text-gold-400",
              )}
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 pl-10 xl:flex">
          <Link href="/reports" className="text-xs uppercase tracking-wide text-silver-400 hover:text-gold-400">
            Reports
          </Link>
          <Link href="/account" className="text-xs uppercase tracking-wide text-silver-400 hover:text-gold-400">
            Client Login
          </Link>
          <Button href="/contact" className="!px-6 !py-2.5 text-xs">
            {t("cta")}
          </Button>
        </div>

        <button
          aria-label="Toggle menu"
          className="flex flex-col gap-1.5 xl:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="h-px w-6 bg-silver-100" />
          <span className="h-px w-6 bg-silver-100" />
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-white/5 px-6 pb-6 xl:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-3 text-sm uppercase tracking-wide text-silver-300 hover:text-gold-400"
            >
              {t(link.key)}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-2 py-3 text-sm uppercase tracking-wide text-gold-400"
          >
            {t("cta")}
          </Link>
        </nav>
      )}
    </header>
  );
}
