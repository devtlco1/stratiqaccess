import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { CampaignStatus, EmailCampaignRow } from "@/lib/email/dbTypes";
import { EmailCenterNav } from "../EmailCenterNav";

const STATUS_STYLES: Record<CampaignStatus, string> = {
  draft: "bg-navy/10 text-navy",
  scheduled: "bg-blue-100 text-blue-700",
  sending: "bg-amber-100 text-amber-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
};

export default async function CampaignsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("email_campaigns").select("*").order("created_at", { ascending: false });
  const campaigns = (data ?? []) as EmailCampaignRow[];

  return (
    <AdminShell>
      <EmailCenterNav active="/admin/email-center/campaigns" />
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Campaigns</h1>
        <Link
          href="/admin/email-center/campaigns/new"
          className="rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors"
        >
          + New Campaign
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {campaigns.length === 0 && <p className="text-sm text-ink/60">No campaigns yet.</p>}
        {campaigns.map((campaign) => (
          <Link
            key={campaign.id}
            href={`/admin/email-center/campaigns/${campaign.id}`}
            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <p className="font-medium text-navy">{campaign.name}</p>
              <p className="text-sm text-ink/60">{campaign.total_recipients} recipients</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[campaign.status]}`}>
              {campaign.status}
            </span>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
