import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import type { CampaignStatus, EmailCampaignRow, RecipientStatus } from "@/lib/email/dbTypes";
import { pauseCampaign, resumeCampaign, cancelUnsentRecipients, retryFailedRecipients } from "../actions";

const RECIPIENT_STATUSES: RecipientStatus[] = ["pending", "queued", "sending", "sent", "failed", "skipped", "suppressed", "replied", "unsubscribed"];

export function CampaignDashboard({
  campaign,
  statusCounts,
}: {
  campaign: EmailCampaignRow;
  statusCounts: Record<string, number>;
}) {
  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const sent = statusCounts.sent ?? 0;
  const progressPct = total ? Math.round((sent / total) * 100) : 0;

  const pauseWithId = pauseCampaign.bind(null, campaign.id);
  const resumeWithId = resumeCampaign.bind(null, campaign.id);
  const cancelWithId = cancelUnsentRecipients.bind(null, campaign.id);
  const retryWithId = retryFailedRecipients.bind(null, campaign.id);

  return (
    <div className="mt-8 flex flex-col gap-6 max-w-3xl">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <StatusBadge status={campaign.status} />
          <p className="text-sm text-ink/60">{progressPct}% sent</p>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-paper">
          <div className="h-full bg-stratiq-blue transition-all" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="mt-5 grid grid-cols-3 sm:grid-cols-5 gap-3 text-center">
          {RECIPIENT_STATUSES.map((status) => (
            <div key={status}>
              <p className="font-display text-lg text-navy">{statusCounts[status] ?? 0}</p>
              <p className="text-xs capitalize text-ink/60">{status}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {(campaign.status === "sending" || campaign.status === "scheduled") && (
            <form action={pauseWithId}>
              <ConfirmSubmitButton size="sm" variant="secondary" confirmMessage="Pause this campaign? Already-sent emails cannot be recalled; remaining recipients stay queued until resumed.">
                Pause
              </ConfirmSubmitButton>
            </form>
          )}
          {campaign.status === "paused" && (
            <form action={resumeWithId}>
              <ConfirmSubmitButton size="sm" confirmMessage="Resume sending this campaign?">Resume</ConfirmSubmitButton>
            </form>
          )}
          {["sending", "scheduled", "paused"].includes(campaign.status) && (
            <form action={cancelWithId}>
              <ConfirmSubmitButton size="sm" variant="danger" confirmMessage="Cancel all unsent recipients for this campaign? Already-sent emails are not affected. This cannot be undone.">
                Cancel Unsent
              </ConfirmSubmitButton>
            </form>
          )}
          {(statusCounts.failed ?? 0) > 0 && (
            <form action={retryWithId}>
              <ConfirmSubmitButton size="sm" variant="secondary" confirmMessage={`Retry ${statusCounts.failed} failed recipient(s)?`}>
                Retry Failed ({statusCounts.failed})
              </ConfirmSubmitButton>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const STATUS_STYLES: Record<CampaignStatus, string> = {
  draft: "bg-navy/10 text-navy",
  scheduled: "bg-blue-100 text-blue-700",
  sending: "bg-amber-100 text-amber-700",
  paused: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  failed: "bg-red-100 text-red-700",
};

function StatusBadge({ status }: { status: CampaignStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[status]}`}>{status}</span>;
}
