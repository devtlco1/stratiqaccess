"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/pages", label: "Pages & Sections" },
      { href: "/admin/services", label: "Services" },
      { href: "/admin/sectors", label: "Sectors" },
      { href: "/admin/insights", label: "Insights / Articles" },
    ],
  },
  {
    label: "Market Access",
    items: [
      { href: "/admin/tenders", label: "Tenders" },
      { href: "/admin/opportunities", label: "Investment Opportunities" },
      { href: "/admin/reports", label: "Paid Reports" },
      { href: "/admin/purchases", label: "Purchases" },
    ],
  },
  {
    label: "CRM",
    items: [
      { href: "/admin/leads", label: "Leads & Submissions" },
      { href: "/admin/nda-requests", label: "NDA Requests" },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/admin/users", label: "Users" },
      { href: "/admin/languages", label: "Languages" },
      { href: "/admin/media", label: "Media Library" },
      { href: "/admin/settings", label: "Site Settings" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-navy-900/40 lg:block">
      <div className="px-6 py-6">
        <p className="font-display text-lg text-silver-100">
          STRATIQ <span className="text-gold-400">Access</span>
        </p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-silver-400">Admin Console</p>
      </div>

      <nav className="space-y-8 px-4 pb-10">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-2 text-[11px] uppercase tracking-[0.2em] text-silver-500">{group.label}</p>
            <ul className="mt-2 space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-2 py-2 text-sm text-silver-300 transition-colors hover:text-gold-400",
                      pathname === item.href && "text-gold-400",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
