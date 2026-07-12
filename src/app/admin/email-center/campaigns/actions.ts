"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/email/activityLog";
import { sanitizeComposedHtml, stripHtmlToText } from "@/lib/email/sanitizeHtml";
import { buildVariableContext, renderEmail } from "@/lib/email/templateVariables";
import { buildUnsubscribeUrl } from "@/lib/email/unsubscribeToken";
import { syncCampaignRecipients, type RecipientSelection } from "@/lib/email/campaignRecipients";
import { getMailboxResourceId } from "@/lib/hostinger/mailbox";
import { sendEmail } from "@/lib/hostinger/send";
import type { EmailContactRow } from "@/lib/email/dbTypes";

export async function createCampaignDraft(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  if (!name) throw new Error("Campaign name is required.");

  const { data: settingsRows } = await supabase.from("email_settings").select("key, value").in("key", ["default_batch_size", "default_send_interval_seconds"]);
  const settings = Object.fromEntries((settingsRows ?? []).map((r) => [r.key, r.value]));
  const batchSize = typeof settings.default_batch_size === "number" ? settings.default_batch_size : 20;
  const sendInterval = typeof settings.default_send_interval_seconds === "number" ? settings.default_send_interval_seconds : 120;

  const { data, error } = await supabase
    .from("email_campaigns")
    .insert({
      name,
      description,
      status: "draft",
      subject_snapshot: "",
      html_snapshot: "",
      batch_size: batchSize,
      send_interval_seconds: sendInterval,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, { actorType: "user", actorId: user?.id, action: "campaign.created", entityType: "email_campaign", entityId: data.id, metadata: { name } });

  revalidatePath("/admin/email-center/campaigns");
  redirect(`/admin/email-center/campaigns/${data.id}`);
}

export async function updateCampaignRecipients(id: string, formData: FormData) {
  const supabase = await createClient();
  const selection: RecipientSelection = {
    contactIds: formData.getAll("contact_ids").map(String),
    listIds: formData.getAll("list_ids").map(String),
    filters: {
      status: String(formData.get("filter_status") || "") || undefined,
      country: String(formData.get("filter_country") || "") || undefined,
      sector: String(formData.get("filter_sector") || "") || undefined,
      tag: String(formData.get("filter_tag") || "") || undefined,
    },
    manualEmails: String(formData.get("manual_emails") || "")
      .split(/[\n,]/)
      .map((e) => e.trim())
      .filter(Boolean),
  };

  const summary = await syncCampaignRecipients(supabase, id, selection);

  revalidatePath(`/admin/email-center/campaigns/${id}`);
  return summary;
}

export async function chooseCampaignTemplate(id: string, formData: FormData) {
  const supabase = await createClient();
  const templateId = String(formData.get("template_id") || "");
  if (!templateId) return;

  const { data: template, error } = await supabase.from("email_templates").select("*").eq("id", templateId).single();
  if (error || !template) throw new Error("Template not found.");

  await supabase
    .from("email_campaigns")
    .update({
      template_id: template.id,
      subject_snapshot: template.subject,
      html_snapshot: template.html_body,
      text_snapshot: template.text_body,
    })
    .eq("id", id);

  revalidatePath(`/admin/email-center/campaigns/${id}`);
}

export async function updateCampaignContent(id: string, formData: FormData) {
  const supabase = await createClient();
  const subject = String(formData.get("subject_snapshot") || "").trim();
  const html = sanitizeComposedHtml(String(formData.get("html_snapshot") || ""));
  const text = String(formData.get("text_snapshot") || "").trim() || null;
  const fromDisplayName = String(formData.get("from_display_name") || "").trim() || null;

  if (!subject || !html) throw new Error("Subject and body are required.");

  const { error } = await supabase
    .from("email_campaigns")
    .update({ subject_snapshot: subject, html_snapshot: html, text_snapshot: text, from_display_name: fromDisplayName })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/email-center/campaigns/${id}`);
}

export async function updateCampaignAttachments(id: string, formData: FormData) {
  const supabase = await createClient();
  const attachmentIds = formData.getAll("attachment_ids").map(String);
  const { error } = await supabase.from("email_campaigns").update({ attachment_ids: attachmentIds }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/email-center/campaigns/${id}`);
}

export interface CampaignPreviewResult {
  contactName: string;
  contactEmail: string;
  subject: string;
  html: string;
  missingVariables: string[];
}

export async function previewCampaignForContacts(campaignId: string, contactIds: string[]): Promise<CampaignPreviewResult[]> {
  const supabase = await createClient();
  const { data: campaign } = await supabase.from("email_campaigns").select("*").eq("id", campaignId).single();
  if (!campaign) return [];

  const { data: contacts } = await supabase.from("email_contacts").select("*").in("id", contactIds.slice(0, 5));

  return ((contacts ?? []) as EmailContactRow[]).map((contact) => {
    const context = buildVariableContext(contact, campaign.from_display_name || "STRATIQ Access", buildUnsubscribeUrl(contact.id));
    const rendered = renderEmail({ subject: campaign.subject_snapshot, html: campaign.html_snapshot, text: campaign.text_snapshot }, context);
    return {
      contactName: contact.name,
      contactEmail: contact.email,
      subject: rendered.subject,
      html: sanitizeComposedHtml(rendered.html),
      missingVariables: rendered.missingVariables,
    };
  });
}

export async function sendCampaignTestEmail(campaignId: string, testEmail: string, contactId: string | null): Promise<{ success: boolean; error?: string }> {
  if (!testEmail?.trim()) return { success: false, error: "Enter an administrator email address." };

  const supabase = await createClient();
  const { data: campaign } = await supabase.from("email_campaigns").select("*").eq("id", campaignId).single();
  if (!campaign) return { success: false, error: "Campaign not found." };

  let context;
  if (contactId) {
    const { data: contact } = await supabase.from("email_contacts").select("*").eq("id", contactId).single();
    if (!contact) return { success: false, error: "Contact not found." };
    context = buildVariableContext(contact, campaign.from_display_name || "STRATIQ Access", buildUnsubscribeUrl(contact.id));
  } else {
    context = buildVariableContext(
      { name: "Sample Contact", company_name: "Sample Company", email: "sample@example.com", job_title: "Director", sector: "Energy", country: "UAE", website: "example.com" },
      campaign.from_display_name || "STRATIQ Access",
      `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/unsubscribe?token=sample`
    );
  }

  const rendered = renderEmail({ subject: campaign.subject_snapshot, html: campaign.html_snapshot, text: campaign.text_snapshot }, context);
  if (rendered.missingVariables.length > 0) {
    return { success: false, error: `Unresolved variables: ${rendered.missingVariables.join(", ")}` };
  }

  try {
    const mailboxResourceId = await getMailboxResourceId(supabase);
    await sendEmail(mailboxResourceId, {
      to: [testEmail.trim()],
      subject: `[TEST] ${rendered.subject}`,
      html: sanitizeComposedHtml(rendered.html),
      text: rendered.text ?? stripHtmlToText(rendered.html),
    });

    await supabase.from("email_campaigns").update({ test_sent_to: testEmail.trim(), test_sent_at: new Date().toISOString() }).eq("id", campaignId);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to send test email." };
  }
}

export interface CampaignConfirmationSummary {
  pending: number;
  suppressed: number;
  failed: number;
  total: number;
}

export async function getCampaignConfirmationSummary(campaignId: string): Promise<CampaignConfirmationSummary> {
  const supabase = await createClient();
  const { data } = await supabase.from("email_campaign_recipients").select("status").eq("campaign_id", campaignId);
  const rows = data ?? [];
  return {
    pending: rows.filter((r) => r.status === "pending").length,
    suppressed: rows.filter((r) => r.status === "suppressed").length,
    failed: rows.filter((r) => r.status === "failed").length,
    total: rows.length,
  };
}

export async function queueCampaign(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const scheduledAt = String(formData.get("scheduled_at") || "");

  const { data: campaign } = await supabase.from("email_campaigns").select("*").eq("id", id).single();
  if (!campaign) throw new Error("Campaign not found.");
  if (!campaign.subject_snapshot || !campaign.html_snapshot) throw new Error("Choose a template and content before queueing.");

  const { count: pendingCount } = await supabase
    .from("email_campaign_recipients")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", id)
    .eq("status", "pending");
  if (!pendingCount) throw new Error("No pending recipients — sync recipients before queueing.");

  if (scheduledAt) {
    await supabase.from("email_campaigns").update({ status: "scheduled", scheduled_at: new Date(scheduledAt).toISOString() }).eq("id", id);
  } else {
    await supabase.from("email_campaigns").update({ status: "sending", started_at: new Date().toISOString() }).eq("id", id);
  }

  await logActivity(supabase, {
    actorType: "user",
    actorId: user?.id,
    action: scheduledAt ? "campaign.scheduled" : "campaign.queued",
    entityType: "email_campaign",
    entityId: id,
    metadata: { pendingCount, scheduledAt: scheduledAt || null },
  });

  revalidatePath(`/admin/email-center/campaigns/${id}`);
  redirect(`/admin/email-center/campaigns/${id}`);
}

export async function pauseCampaign(id: string) {
  const supabase = await createClient();
  await supabase.from("email_campaigns").update({ status: "paused" }).eq("id", id).in("status", ["sending", "scheduled"]);
  revalidatePath(`/admin/email-center/campaigns/${id}`);
}

export async function resumeCampaign(id: string) {
  const supabase = await createClient();
  await supabase.from("email_campaigns").update({ status: "sending" }).eq("id", id).eq("status", "paused");
  revalidatePath(`/admin/email-center/campaigns/${id}`);
}

export async function cancelUnsentRecipients(id: string) {
  const supabase = await createClient();
  await supabase.from("email_campaign_recipients").update({ status: "skipped" }).eq("campaign_id", id).in("status", ["pending", "queued"]);
  await supabase.from("email_campaigns").update({ status: "cancelled" }).eq("id", id);
  revalidatePath(`/admin/email-center/campaigns/${id}`);
}

export async function retryFailedRecipients(id: string) {
  const supabase = await createClient();
  const { count: failedCount } = await supabase
    .from("email_campaign_recipients")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", id)
    .eq("status", "failed");

  if (!failedCount) return;

  await supabase.from("email_campaign_recipients").update({ status: "pending", last_error: null }).eq("campaign_id", id).eq("status", "failed");
  await supabase.from("email_campaigns").update({ status: "sending" }).eq("id", id).in("status", ["completed", "failed", "paused"]);

  revalidatePath(`/admin/email-center/campaigns/${id}`);
}

export async function deleteCampaignDraft(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("email_campaigns").delete().eq("id", id).eq("status", "draft");
  if (error) throw new Error(error.message);

  revalidatePath("/admin/email-center/campaigns");
  redirect("/admin/email-center/campaigns");
}
