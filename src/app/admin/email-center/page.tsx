import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { EmailCampaignRow, EmailThreadRow } from "@/lib/email/dbTypes";
import { EmailCenterNav } from "./EmailCenterNav";

export default async function EmailCenterOverviewPage() {
  const supabase = await createClient();

  const [
    totalContacts,
    activeContacts,
    sentCount,
    queuedCount,
    failedCount,
    unreadCount,
    repliedCount,
    activeCampaigns,
    recentThreads,
  ] = await Promise.all([
    supabase.from("email_contacts").select("id", { count: "exact", head: true }),
    supabase.from("email_contacts").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("email_campaign_recipients").select("id", { count: "exact", head: true }).eq("status", "sent"),
    supabase
      .from("email_campaign_recipients")
      .select("id", { count: "exact", head: true })
      .in("status", ["pending", "queued", "sending"]),
    supabase.from("email_campaign_recipients").select("id", { count: "exact", head: true }).eq("status", "failed"),
    supabase.from("email_messages").select("id", { count: "exact", head: true }).eq("direction", "inbound").eq("is_read", false),
    supabase.from("email_campaign_recipients").select("id", { count: "exact", head: true }).eq("status", "replied"),
    supabase
      .from("email_campaigns")
      .select("*")
      .in("status", ["sending", "scheduled", "paused"])
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("email_threads").select("*").order("last_message_at", { ascending: false }).limit(8),
  ]);

  const campaigns = (activeCampaigns.data ?? []) as EmailCampaignRow[];
  const threads = (recentThreads.data ?? []) as EmailThreadRow[];

  const campaignProgress = await Promise.all(
    campaigns.map(async (campaign) => {
      const { data } = await supabase.from("email_campaign_recipients").select("status").eq("campaign_id", campaign.id);
      const rows = data ?? [];
      const counts = {
        total: rows.length,
        sent: rows.filter((r) => r.status === "sent").length,
        failed: rows.filter((r) => r.status === "failed").length,
        pending: rows.filter((r) => ["pending", "queued", "sending"].includes(r.status)).length,
      };
      return { campaign, counts };
    })
  );

  const cards = [
    { label: "Total Contacts", count: totalContacts.count ?? 0, href: "/admin/email-center/contacts" },
    { label: "Active Contacts", count: activeContacts.count ?? 0, href: "/admin/email-center/contacts?status=active" },
    { label: "Emails Sent", count: sentCount.count ?? 0, href: "/admin/email-center/sent" },
    { label: "Emails Queued", count: queuedCount.count ?? 0, href: "/admin/email-center/campaigns" },
    { label: "Failed Emails", count: failedCount.count ?? 0, href: "/admin/email-center/campaigns" },
    { label: "New Replies", count: repliedCount.count ?? 0, href: "/admin/email-center/inbox" },
    { label: "Unread Messages", count: unreadCount.count ?? 0, href: "/admin/email-center/inbox" },
  ];

  return (
    <AdminShell>
      <EmailCenterNav active="/admin/email-center" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-navy">Email Center</h1>
          <p className="mt-2 text-sm text-ink/60">
            partners@stratiqaccess.com via Hostinger Agentic Mail —{" "}
            <Link href="/admin/email-center/settings" className="text-stratiq-blue hover:text-navy transition-colors">
              connection status
            </Link>
          </p>
        </div>
        <Link
          href="/admin/email-center/campaigns/new"
          className="rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors"
        >
          + New Campaign
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section>
          <h2 className="font-display text-lg text-navy">Active Campaigns</h2>
          <div className="mt-4 flex flex-col gap-3">
            {campaignProgress.length === 0 && (
              <p className="text-sm text-ink/60">No campaigns are sending, scheduled, or paused right now.</p>
            )}
            {campaignProgress.map(({ campaign, counts }) => (
              <Link
                key={campaign.id}
                href={`/admin/email-center/campaigns/${campaign.id}`}
                className="rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-navy">{campaign.name}</p>
                  <span className="rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy capitalize">
                    {campaign.status}
                  </span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-paper">
                  <div
                    className="h-full bg-stratiq-blue transition-all"
                    style={{ width: `${counts.total ? Math.round((counts.sent / counts.total) * 100) : 0}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-ink/60">
                  {counts.sent} sent · {counts.pending} pending · {counts.failed} failed · {counts.total} total
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg text-navy">Recent Conversations</h2>
          <div className="mt-4 flex flex-col gap-3">
            {threads.length === 0 && <p className="text-sm text-ink/60">No conversations yet.</p>}
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/admin/email-center/inbox/${thread.id}`}
                className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-navy">{thread.contact_email}</p>
                  <p className="truncate text-sm text-ink/60">{thread.last_message_preview || "—"}</p>
                </div>
                {thread.is_unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-stratiq-blue" />}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
