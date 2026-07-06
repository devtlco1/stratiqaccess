"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";
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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="glass-nav sticky top-0 z-50 border-b border-ivory-100/8">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/brand/stratiq-wordmark.png"
            alt="STRATIQ Access"
            width={165}
            height={46}
            priority
            className="h-9 w-auto sm:h-10"
          />
        </Link>

        <nav className="hidden items-center gap-6 min-[1200px]:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative whitespace-nowrap py-1 text-[14.5px] text-muted-500 transition-colors hover:text-ivory-100",
                pathname === link.href && "text-cyan-300",
              )}
            >
              {t(link.key)}
              {pathname === link.href && (
                <span className="absolute -bottom-1 start-0 h-px w-full bg-gradient-to-r from-blue-500 to-cyan-400" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 pl-6 min-[1200px]:flex">
          <Link
            href="/account"
            aria-label={t("clientLogin")}
            className="flex items-center gap-1.5 text-[14.5px] text-muted-600 transition-colors hover:text-cyan-300"
          >
            <User size={16} />
          </Link>
          <Button href="/contact" className="!px-5 !py-2.5 text-sm whitespace-nowrap">
            {t("cta")}
          </Button>
        </div>

        <button
          aria-label={t("toggleMenu")}
          className="flex flex-col items-end gap-1.5 min-[1200px]:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={cn("h-px w-7 bg-ivory-100 transition-transform", open && "translate-y-[7px] rotate-45")} />
          <span className={cn("h-px w-5 bg-ivory-100 transition-opacity", open && "opacity-0")} />
          <span className={cn("h-px w-7 bg-ivory-100 transition-transform", open && "-translate-y-[7px] -rotate-45")} />
        </button>
      </div>

      {open && (
        <div className="glass-nav absolute inset-x-0 top-full h-[calc(100vh-4.5rem)] overflow-y-auto border-t border-ivory-100/8 min-[1200px]:hidden">
          <nav className="flex flex-col px-6 py-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-ivory-100/8 py-4 text-lg text-ivory-100 hover:text-cyan-300"
              >
                {t(link.key)}
              </Link>
            ))}
            <Link
              href="/reports"
              onClick={() => setOpen(false)}
              className="border-b border-ivory-100/8 py-4 text-lg text-muted-500 hover:text-ivory-100"
            >
              {t("reports")}
            </Link>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="border-b border-ivory-100/8 py-4 text-lg text-muted-500 hover:text-ivory-100"
            >
              {t("clientLogin")}
            </Link>
            <Button href="/contact" className="mt-6 w-full" onClick={() => setOpen(false)}>
              {t("cta")}
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
