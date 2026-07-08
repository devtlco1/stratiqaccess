import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { LogoutButton } from "./LogoutButton";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Services", href: "/admin/services" },
  { label: "Clients", href: "/admin/clients" },
  { label: "Sectors", href: "/admin/sectors" },
  { label: "Case Studies", href: "/admin/case-studies" },
  { label: "Insights", href: "/admin/insights" },
  { label: "Site Images", href: "/admin/site-images" },
  { label: "Messages", href: "/admin/messages" },
  { label: "Site Settings", href: "/admin/settings" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-navy/10 bg-white p-6 lg:flex">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/brand/stratiq-logo.svg" alt="STRATIQ Access" width={160} height={65} className="h-8 w-auto" />
          <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">Admin</span>
        </Link>
        <nav className="mt-10 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink/70 hover:bg-paper hover:text-navy transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <Link href="/" target="_blank" className="text-sm text-stratiq-blue hover:text-navy transition-colors">
            View live site ↗
          </Link>
          <LogoutButton />
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10">{children}</main>
    </div>
  );
}
