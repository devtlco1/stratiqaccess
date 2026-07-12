import type { SupabaseClient } from "@supabase/supabase-js";
import { HostingerApiError } from "@/lib/hostinger/types";
import { getMailboxResourceId } from "@/lib/hostinger/mailbox";
import { sendEmail } from "@/lib/hostinger/send";
import { buildVariableContext, renderEmail } from "./templateVariables";
import { buildUnsubscribeUrl } from "./unsubscribeToken";
import { isSuppressed } from "./suppressionCheck";
import { findOrCreateThread, touchThread } from "./threadMatching";
import { loadCampaignAttachments } from "./campaignAttachments";
import { logActivity } from "./activityLog";
import type { EmailCampaignRecipientRow, EmailCampaignRow, EmailContactRow } from "./dbTypes";

const MAX_ATTEMPTS = 5;
const CONCURRENCY = 4;
const RATE_LIMIT_CIRCUIT_BREAKER_THRESHOLD = 3;

async function runWithConcurrency<T>(items: T[], limit: number, worker: (item: T) => Promise<void>): Promise<void> {
  let index = 0;
  async function next(): Promise<void> {
    const current = index++;
    if (current >= items.length) return;
    await worker(items[current]);
    return next();
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => next()));
}

export interface QueueProcessResult {
  campaignsProcessed: number;
  recipientsClaimed: number;
  sent: number;
  failed: number;
  suppressed: number;
  circuitBroken: string[];
}

export async function processQueueBatch(supabase: SupabaseClient, lockedBy: string): Promise<QueueProcessResult> {
  const result: QueueProcessResult = { campaignsProcessed: 0, recipientsClaimed: 0, sent: 0, failed: 0, suppressed: 0, circuitBroken: [] };
  const nowIso = new Date().toISOString();

  // Promote due scheduled campaigns.
  await supabase.from("email_campaigns").update({ status: "sending", started_at: nowIso }).eq("status", "scheduled").lte("scheduled_at", nowIso);

  const { data: campaignsData } = await supabase.from("email_campaigns").select("*").eq("status", "sending");
  const campaigns = (campaignsData ?? []) as EmailCampaignRow[];
  if (campaigns.length === 0) {
    await supabase.rpc("fail_stuck_sending_recipients", { p_older_than_minutes: 15 });
    return result;
  }

  const mailboxResourceId = await getMailboxResourceId(supabase);

  for (const campaign of campaigns) {
    const { data: claimedData, error: claimError } = await supabase.rpc("claim_campaign_recipients", {
      p_campaign_id: campaign.id,
      p_batch_size: campaign.batch_size,
      p_locked_by: lockedBy,
    });

    if (claimError) {
      console.error(`[email-queue] claim failed for campaign ${campaign.id}: ${claimError.message}`);
      continue;
    }

    const recipients = (claimedData ?? []) as EmailCampaignRecipientRow[];

    if (recipients.length === 0) {
      const { count: remaining } = await supabase
        .from("email_campaign_recipients")
        .select("id", { count: "exact", head: true })
        .eq("campaign_id", campaign.id)
        .in("status", ["pending", "queued", "sending"]);
      if ((remaining ?? 0) === 0) {
        await supabase.from("email_campaigns").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", campaign.id);
      }
      continue;
    }

    result.campaignsProcessed++;
    result.recipientsClaimed += recipients.length;

    const attachmentsResult = await loadCampaignAttachments(supabase, campaign);
    if (attachmentsResult.overLimit) {
      for (const recipient of recipients) {
        await supabase
          .from("email_campaign_recipients")
          .update({ status: "failed", locked_at: null, last_error: `Attachments exceed the configured ${attachmentsResult.limitMb}MB limit.` })
          .eq("id", recipient.id);
      }
      result.failed += recipients.length;
      continue;
    }

    let rateLimitHits = 0;

    await runWithConcurrency(recipients, CONCURRENCY, async (recipient) => {
      try {
        if (await isSuppressed(supabase, recipient.email_snapshot)) {
          await supabase.from("email_campaign_recipients").update({ status: "suppressed", locked_at: null }).eq("id", recipient.id);
          result.suppressed++;
          return;
        }

        const { data: contactData } = await supabase.from("email_contacts").select("*").eq("id", recipient.contact_id).single();
        const contact = contactData as EmailContactRow | null;
        if (!contact) {
          await supabase.from("email_campaign_recipients").update({ status: "failed", locked_at: null, last_error: "Contact record no longer exists." }).eq("id", recipient.id);
          result.failed++;
          return;
        }

        const unsubscribeUrl = buildUnsubscribeUrl(contact.id);
        const context = buildVariableContext(contact, campaign.from_display_name || "STRATIQ Access", unsubscribeUrl);
        const rendered = renderEmail({ subject: campaign.subject_snapshot, html: campaign.html_snapshot, text: campaign.text_snapshot }, context);

        if (rendered.missingVariables.length > 0) {
          await supabase
            .from("email_campaign_recipients")
            .update({ status: "failed", locked_at: null, last_error: `Unresolved variables: ${rendered.missingVariables.join(", ")}` })
            .eq("id", recipient.id);
          result.failed++;
          return;
        }

        const sentAt = new Date();
        await sendEmail(mailboxResourceId, {
          to: [contact.email],
          displayName: campaign.from_display_name ?? undefined,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text ?? undefined,
          attachments: attachmentsResult.attachments.length > 0 ? attachmentsResult.attachments : undefined,
        });

        const thread = await findOrCreateThread(supabase, {
          contactId: contact.id,
          contactEmail: contact.email,
          subject: rendered.subject,
          messageDate: sentAt,
          campaignId: campaign.id,
        });
        await touchThread(supabase, thread.id, { lastMessageAt: sentAt, preview: rendered.text?.slice(0, 200) ?? null, markUnread: false });

        await supabase.from("email_messages").insert({
          thread_id: thread.id,
          direction: "outbound",
          subject: rendered.subject,
          body_html: rendered.html,
          body_text: rendered.text,
          from_email: process.env.HOSTINGER_MAILBOX ?? "",
          to_emails: [contact.email],
          campaign_recipient_id: recipient.id,
          message_date: sentAt.toISOString(),
          is_read: true,
        });

        await supabase
          .from("email_campaign_recipients")
          .update({ status: "sent", sent_at: sentAt.toISOString(), locked_at: null, thread_id: thread.id, last_error: null })
          .eq("id", recipient.id);
        await supabase.from("email_contacts").update({ last_contacted_at: sentAt.toISOString() }).eq("id", contact.id);
        result.sent++;
      } catch (error) {
        if (error instanceof HostingerApiError) {
          if (error.status === 429) rateLimitHits++;
          const retryable = error.status === 429 || error.status >= 500;
          if (retryable && recipient.attempt_count < MAX_ATTEMPTS) {
            await supabase.from("email_campaign_recipients").update({ status: "pending", locked_at: null, last_error: `${error.code}: ${error.message}` }).eq("id", recipient.id);
          } else {
            await supabase.from("email_campaign_recipients").update({ status: "failed", locked_at: null, last_error: `${error.code}: ${error.message}` }).eq("id", recipient.id);
            result.failed++;
          }
        } else {
          const message = error instanceof Error ? error.message : "Unknown error";
          await supabase.from("email_campaign_recipients").update({ status: "failed", locked_at: null, last_error: message }).eq("id", recipient.id);
          result.failed++;
        }
      }
    });

    if (rateLimitHits >= RATE_LIMIT_CIRCUIT_BREAKER_THRESHOLD) {
      await supabase.from("email_campaigns").update({ status: "paused" }).eq("id", campaign.id);
      await logActivity(supabase, {
        actorType: "cron",
        action: "campaign.auto_paused_rate_limit",
        entityType: "email_campaign",
        entityId: campaign.id,
        metadata: { rateLimitHits },
      });
      result.circuitBroken.push(campaign.id);
    }
  }

  await supabase.rpc("fail_stuck_sending_recipients", { p_older_than_minutes: 15 });

  return result;
}
