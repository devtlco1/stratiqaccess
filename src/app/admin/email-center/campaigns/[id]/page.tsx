import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import type {
  EmailAttachmentRow,
  EmailCampaignRecipientRow,
  EmailCampaignRow,
  EmailContactListRow,
  EmailContactRow,
  EmailTemplateRow,
} from "@/lib/email/dbTypes";
import { RecipientsForm } from "./RecipientsForm";
import { PreviewAndTestSection } from "./PreviewAndTestSection";
import { CampaignDashboard } from "./CampaignDashboard";
import {
  chooseCampaignTemplate,
  updateCampaignContent,
  updateCampaignAttachments,
  queueCampaign,
  deleteCampaignDraft,
} from "../actions";

export default async function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: campaignData }, { data: contactsData }, { data: listsData }, { data: templatesData }, { data: attachmentsData }, { data: recipientsData }] =
    await Promise.all([
      supabase.from("email_campaigns").select("*").eq("id", id).single(),
      supabase.from("email_contacts").select("*").eq("status", "active").order("name").limit(500),
      supabase.from("email_contact_lists").select("*").order("name"),
      supabase.from("email_templates").select("*").eq("is_active", true).order("name"),
      supabase.from("email_attachments").select("*").order("filename"),
      supabase.from("email_campaign_recipients").select("*").eq("campaign_id", id),
    ]);

  const campaign = campaignData as EmailCampaignRow | null;
  if (!campaign) notFound();

  const contacts = (contactsData ?? []) as EmailContactRow[];
  const lists = (listsData ?? []) as EmailContactListRow[];
  const templates = (templatesData ?? []) as EmailTemplateRow[];
  const attachments = (attachmentsData ?? []) as EmailAttachmentRow[];
  const recipients = (recipientsData ?? []) as EmailCampaignRecipientRow[];

  const statusCounts: Record<string, number> = {};
  for (const r of recipients) statusCounts[r.status] = (statusCounts[r.status] ?? 0) + 1;

  const pendingRecipients = recipients.filter((r) => r.status === "pending");
  const attachmentIdSet = new Set(campaign.attachment_ids);

  const chooseTemplateWithId = chooseCampaignTemplate.bind(null, id);
  const updateContentWithId = updateCampaignContent.bind(null, id);
  const updateAttachmentsWithId = updateCampaignAttachments.bind(null, id);
  const queueWithId = queueCampaign.bind(null, id);
  const deleteWithId = deleteCampaignDraft.bind(null, id);

  if (campaign.status !== "draft") {
    return (
      <AdminShell>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-navy">{campaign.name}</h1>
        </div>
        <CampaignDashboard campaign={campaign} statusCounts={statusCounts} />
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">{campaign.name}</h1>
        <form action={deleteWithId}>
          <ConfirmSubmitButton size="sm" variant="danger" confirmMessage="Delete this draft campaign? This cannot be undone.">
            Delete Draft
          </ConfirmSubmitButton>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-lg text-navy">Step 2 — Recipients</h2>
        <RecipientsForm campaignId={id} contacts={contacts} lists={lists} />
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg text-navy">Step 3 — Template</h2>
        <form action={chooseTemplateWithId} className="mt-3 flex items-center gap-3">
          <select name="template_id" defaultValue={campaign.template_id ?? ""} className="rounded-lg border border-navy/15 px-4 py-2.5 text-sm">
            <option value="">Choose a template…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <SubmitButton size="sm">Load Template</SubmitButton>
        </form>
      </section>

      <section className="mt-10 max-w-2xl">
        <h2 className="font-display text-lg text-navy">Step 4 — Subject &amp; Body</h2>
        <p className="mt-1 text-sm text-ink/60">Editing here only changes this campaign — the original template is untouched.</p>
        <form action={updateContentWithId} className="mt-3 flex flex-col gap-4">
          <input
            name="from_display_name"
            defaultValue={campaign.from_display_name ?? ""}
            placeholder="From display name (optional)"
            className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm"
          />
          <input
            name="subject_snapshot"
            required
            defaultValue={campaign.subject_snapshot}
            placeholder="Subject"
            className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm"
          />
          <textarea
            name="html_snapshot"
            required
            rows={12}
            defaultValue={campaign.html_snapshot}
            className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm font-mono"
          />
          <textarea
            name="text_snapshot"
            rows={5}
            defaultValue={campaign.text_snapshot ?? ""}
            placeholder="Plain-text fallback"
            className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm"
          />
          <SubmitButton size="sm">Save Content</SubmitButton>
        </form>
      </section>

      <section className="mt-10 max-w-2xl">
        <h2 className="font-display text-lg text-navy">Step 5 — Attachments</h2>
        {attachments.length === 0 ? (
          <p className="mt-2 text-sm text-ink/60">No attachments in your library yet.</p>
        ) : (
          <form action={updateAttachmentsWithId} className="mt-3 flex flex-col gap-2">
            {attachments.map((a) => (
              <label key={a.id} className="flex items-center gap-2 text-sm text-ink/80">
                <input type="checkbox" name="attachment_ids" value={a.id} defaultChecked={attachmentIdSet.has(a.id)} className="size-4 rounded border-navy/30" />
                {a.filename}
              </label>
            ))}
            <SubmitButton size="sm">Save Attachments</SubmitButton>
          </form>
        )}
      </section>

      <section className="mt-10 max-w-3xl">
        <h2 className="font-display text-lg text-navy">Steps 6–7 — Preview &amp; Test Send</h2>
        {!campaign.subject_snapshot || !campaign.html_snapshot ? (
          <p className="mt-2 text-sm text-ink/60">Choose a template and save content first.</p>
        ) : (
          <div className="mt-3">
            <PreviewAndTestSection campaignId={id} recipients={pendingRecipients} />
          </div>
        )}
      </section>

      <section className="mt-10 max-w-xl rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg text-navy">Steps 8–9 — Confirm &amp; Queue</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-ink/70">
          <p>Selected contacts: <strong className="text-navy">{recipients.length}</strong></p>
          <p>Suppressed: <strong className="text-navy">{statusCounts.suppressed ?? 0}</strong></p>
          <p>Final send count: <strong className="text-stratiq-blue">{statusCounts.pending ?? 0}</strong></p>
          <p>Attachments: <strong className="text-navy">{campaign.attachment_ids.length}</strong></p>
          <p>Template: <strong className="text-navy">{templates.find((t) => t.id === campaign.template_id)?.name ?? "—"}</strong></p>
          <p>Estimated batches: <strong className="text-navy">{Math.ceil((statusCounts.pending ?? 0) / (campaign.batch_size || 20))}</strong></p>
        </div>
        {!campaign.test_sent_at && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Send a test email above before queueing — required to confirm variables resolve correctly.
          </p>
        )}
        <form action={queueWithId} className="mt-4 flex flex-wrap items-center gap-3">
          <input type="datetime-local" name="scheduled_at" className="rounded-lg border border-navy/15 px-3 py-2 text-sm" />
          <ConfirmSubmitButton
            confirmMessage={`Queue this campaign for ${statusCounts.pending ?? 0} recipient(s)? Each will receive one individually personalized email.`}
          >
            Queue Campaign
          </ConfirmSubmitButton>
        </form>
      </section>
    </AdminShell>
  );
}
