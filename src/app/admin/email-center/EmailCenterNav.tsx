import Link from "next/link";

const TABS = [
  { label: "Overview", href: "/admin/email-center" },
  { label: "Inbox", href: "/admin/email-center/inbox" },
  { label: "Sent", href: "/admin/email-center/sent" },
  { label: "Drafts", href: "/admin/email-center/drafts" },
  { label: "Contacts", href: "/admin/email-center/contacts" },
  { label: "Lists", href: "/admin/email-center/lists" },
  { label: "Templates", href: "/admin/email-center/templates" },
  { label: "Campaigns", href: "/admin/email-center/campaigns" },
  { label: "Attachments", href: "/admin/email-center/attachments" },
  { label: "Suppression", href: "/admin/email-center/suppression" },
  { label: "Settings", href: "/admin/email-center/settings" },
  { label: "Activity Logs", href: "/admin/email-center/logs" },
];

// Email Center has 12 sub-sections but only one entry in AdminShell's main
// sidebar — this secondary tab strip is the actual cross-navigation between
// them. Rendered at the top of every Email Center page (a nested layout.tsx
// would be the more typical way to share this, but every existing admin
// page in this codebase wraps itself in <AdminShell> individually rather
// than relying on layout composition, so this matches that convention as a
// component included at the top of each page's content instead).
export function EmailCenterNav({ active }: { active: string }) {
  return (
    <nav className="mb-6 flex flex-wrap gap-1 border-b border-navy/10 pb-1">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`rounded-t-md px-3 py-2 text-sm font-medium transition-colors ${
            active === tab.href ? "border-b-2 border-stratiq-blue text-navy" : "text-ink/50 hover:text-navy"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
