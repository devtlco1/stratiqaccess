"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { mainNav } from "@/data/navigation";
import { siteConfig } from "@/data/siteConfig";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";

export function HeaderClient({ logoLeft, logoRight }: { logoLeft: string; logoRight: string }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-[0_1px_0_rgba(24,32,51,0.08)]">
      <Container className="flex items-center h-20 lg:h-24">
        <Link href="/" className="flex items-center shrink-0 transition-transform duration-300 hover:scale-[1.03]" aria-label={siteConfig.name}>
          <Image src={logoLeft} alt={siteConfig.name} width={176} height={38} priority className="h-8 lg:h-9 w-auto" />
        </Link>

        <nav className="hidden lg:flex flex-1 items-center justify-center gap-1">
          {mainNav.map((item) => (
            <div
              key={item.label}
              className="relative group"
              onMouseEnter={() => item.dropdown && setOpenDropdown(item.label)}
              onMouseLeave={() => item.dropdown && setOpenDropdown(null)}
            >
              <Link
                href={item.href}
                className="relative flex items-center gap-1 px-4 py-2 text-sm font-medium tracking-wide text-ink hover:text-stratiq-blue transition-colors after:absolute after:bottom-1 after:left-4 after:h-px after:w-0 after:bg-stratiq-blue after:transition-all after:duration-300 hover:after:w-[calc(100%-2rem)]"
              >
                {item.label}
                {item.dropdown && (
                  <Icon name="chevron-down" className="size-3.5 transition-transform duration-300 group-hover:rotate-180" />
                )}
              </Link>

              {item.dropdown && (
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 transition-all duration-200 ${
                    openDropdown === item.label
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 -translate-y-1 pointer-events-none"
                  }`}
                >
                  <div className="w-72 rounded-xl bg-white shadow-[0_20px_50px_rgba(24,32,51,0.15)] ring-1 ring-navy/5 overflow-hidden">
                    {item.dropdown.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-5 py-3 text-sm text-ink/80 hover:bg-paper hover:text-stratiq-blue hover:pl-6 transition-all duration-200 border-b border-navy/5 last:border-b-0"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <Link
          href="/"
          className="hidden lg:flex items-center shrink-0 transition-transform duration-300 hover:scale-[1.03]"
          aria-label={siteConfig.name}
        >
          <Image src={logoRight} alt={siteConfig.name} width={176} height={38} className="h-8 lg:h-9 w-auto" />
        </Link>

        <div className="flex lg:hidden flex-1 justify-end">
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="p-2 -mr-2 text-ink"
          >
            <Icon name={mobileOpen ? "x" : "menu"} className="size-7" />
          </button>
        </div>
      </Container>

      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-navy/10 max-h-[calc(100vh-5rem)] overflow-y-auto">
          <Container className="py-4 flex flex-col">
            {mainNav.map((item) => (
              <MobileNavItem key={item.label} label={item.label} href={item.href} dropdown={item.dropdown} />
            ))}
          </Container>
        </div>
      )}
    </header>
  );
}

function MobileNavItem({
  label,
  href,
  dropdown,
}: {
  label: string;
  href: string;
  dropdown?: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);

  if (!dropdown) {
    return (
      <Link href={href} className="py-3 text-base font-medium text-ink border-b border-navy/5">
        {label}
      </Link>
    );
  }

  return (
    <div className="border-b border-navy/5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3 text-base font-medium text-ink"
      >
        {label}
        <Icon name="chevron-down" className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="pb-3 pl-4 flex flex-col gap-1">
          {dropdown.map((link) => (
            <Link key={link.href} href={link.href} className="py-2 text-sm text-ink/70">
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
