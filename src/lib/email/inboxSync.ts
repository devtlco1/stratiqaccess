import type { SupabaseClient } from "@supabase/supabase-js";
import { getMessageText } from "@/lib/hostinger/messages";
import type { HostingerMessage } from "@/lib/hostinger/types";
import { normalizeEmail } from "./contactImport";
import { findOrCreateThread, touchThread } from "./threadMatching";
import { sanitizeReceivedHtml } from "./sanitizeHtml";

// Shared by the inbox "open message" flow and the inbound webhook: given a
// canonical message fetched from the Hostinger API (never from unparsed
// webhook fields), find-or-create its thread, link it to a contact if one
// matches by email, and upsert the email_messages row. Idempotent via the
// partial unique index on (folder, hostinger_uid) — safe to call twice for
// the same message (e.g. webhook redelivery, or the admin re-opening a
// message that was already synced).
export async function syncInboundMessage(
  supabase: SupabaseClient,
  mailboxResourceId: string,
  message: HostingerMessage,
  markThreadUnread = true
): Promise<{ threadId: string; messageRowId: string | null; isNewMessage: boolean }> {
  const { data: existingMessage } = await supabase
    .from("email_messages")
    .select("id, thread_id")
    .eq("folder", message.path)
    .eq("hostinger_uid", message.uid)
    .maybeSingle();

  if (existingMessage) {
    return { threadId: existingMessage.thread_id, messageRowId: existingMessage.id, isNewMessage: false };
  }

  const fromEmail = message.from?.address ? normalizeEmail(message.from.address) : "unknown@unknown";
  const { data: contact } = await supabase.from("email_contacts").select("id").eq("email_normalized", fromEmail).maybeSingle();

  const messageDate = new Date(message.date);
  const thread = await findOrCreateThread(supabase, {
    contactId: contact?.id ?? null,
    contactEmail: fromEmail,
    subject: message.subject,
    messageDate,
  });

  let bodyText: string | null = null;
  let bodyHtml: string | null = null;
  try {
    const text = await getMessageText(mailboxResourceId, message.path, message.uid);
    bodyText = text.text || null;
    bodyHtml = text.html ? sanitizeReceivedHtml(text.html) : null;
  } catch {
    // Best-effort — the message list/detail already gave us headers even if
    // the text/html body fetch fails; still record the message with what we have.
  }

  const { data: inserted, error } = await supabase
    .from("email_messages")
    .upsert(
      {
        thread_id: thread.id,
        direction: "inbound",
        folder: message.path,
        hostinger_uid: message.uid,
        message_id: message.messageId,
        in_reply_to: message.inReplyTo,
        from_email: fromEmail,
        from_name: message.from?.name ?? null,
        to_emails: message.to.map((a) => a.address),
        cc_emails: message.cc.map((a) => a.address),
        bcc_emails: message.bcc.map((a) => a.address),
        subject: message.subject,
        body_text: bodyText,
        body_html: bodyHtml,
        has_attachments: message.attachments.length > 0,
        attachment_meta: message.attachments.map((a) => ({ id: a.id, filename: a.filename, contentType: a.contentType, sizeBytes: a.sizeBytes })),
        is_read: !message.unseen,
        message_date: messageDate.toISOString(),
      },
      { onConflict: "folder,hostinger_uid", ignoreDuplicates: true }
    )
    .select("id")
    .maybeSingle();

  await touchThread(supabase, thread.id, {
    lastMessageAt: messageDate,
    preview: bodyText?.slice(0, 200) ?? message.subject,
    markUnread: markThreadUnread,
  });

  if (error) {
    console.error("[email-center] failed to insert inbound message:", error.message);
  }

  if (contact?.id) {
    await markContactRecipientsAsReplied(supabase, contact.id);
  }

  return { threadId: thread.id, messageRowId: inserted?.id ?? null, isNewMessage: true };
}

// A reply from a contact who was sent an active/recent campaign flips that
// campaign_recipient's status to "replied" — applies regardless of whether
// the inbound message was discovered via the webhook or by an admin
// manually browsing the inbox, since both paths funnel through
// syncInboundMessage.
async function markContactRecipientsAsReplied(supabase: SupabaseClient, contactId: string): Promise<void> {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data: recentCampaigns } = await supabase
    .from("email_campaigns")
    .select("id")
    .in("status", ["sending", "scheduled", "paused", "completed"])
    .gte("created_at", ninetyDaysAgo);

  const campaignIds = (recentCampaigns ?? []).map((c) => c.id);
  if (campaignIds.length === 0) return;

  await supabase
    .from("email_campaign_recipients")
    .update({ status: "replied" })
    .eq("contact_id", contactId)
    .in("status", ["sent", "queued", "sending"])
    .in("campaign_id", campaignIds);
}
