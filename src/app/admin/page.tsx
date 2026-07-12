import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [services, clients, sectors, caseStudies, insights, messages, emailUnread, emailQueued, emailSent] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("sectors").select("id", { count: "exact", head: true }),
    supabase.from("case_studies").select("id", { count: "exact", head: true }),
    supabase.from("insights").select("id", { count: "exact", head: true }),
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("email_messages").select("id", { count: "exact", head: true }).eq("direction", "inbound").eq("is_read", false),
    supabase
      .from("email_campaign_recipients")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "queued", "sending"]),
    supabase.from("email_campaign_recipients").select("id", { count: "exact", head: true }).eq("status", "sent"),
  ]);

  const cards = [
    { label: "Services", count: services.count ?? 0, href: "/admin/services" },
    { label: "Clients", count: clients.count ?? 0, href: "/admin/clients" },
    { label: "Sectors", count: sectors.count ?? 0, href: "/admin/sectors" },
    { label: "Case Studies", count: caseStudies.count ?? 0, href: "/admin/case-studies" },
    { label: "Insights", count: insights.count ?? 0, href: "/admin/insights" },
    { label: "Unread Messages", count: messages.count ?? 0, href: "/admin/messages" },
    { label: "Email Center: Unread", count: emailUnread.count ?? 0, href: "/admin/email-center/inbox" },
    { label: "Email Center: Queued", count: emailQueued.count ?? 0, href: "/admin/email-center/campaigns" },
    { label: "Email Center: Sent", count: emailSent.count ?? 0, href: "/admin/email-center/sent" },
  ];

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-navy">Dashboard</h1>
      <p className="mt-2 text-sm text-ink/60">Manage everything shown on the public site from here.</p>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl bg-white p-6 text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <p className="font-display text-3xl text-stratiq-blue">{card.count}</p>
            <p className="mt-1 text-sm text-ink/70">{card.label}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
