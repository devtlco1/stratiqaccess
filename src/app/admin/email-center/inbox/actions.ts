"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/email/activityLog";
import { sanitizeComposedHtml, stripHtmlToText } from "@/lib/email/sanitizeHtml";
import { getMailboxResourceId } from "@/lib/hostinger/mailbox";
import { getMessage, markRead, markUnread, moveMessage, deleteMessage as deleteHostingerMessage } from "@/lib/hostinger/messages";
import { sendEmail } from "@/lib/hostinger/send";
import type { HostingerSendAttachment } from "@/lib/hostinger/types";
import { syncInboundMessage } from "@/lib/email/inboxSync";
import { findOrCreateThread, touchThread } from "@/lib/email/threadMatching";

async function loadReplyAttachments(supabase: SupabaseClient, attachmentIds: string[]): Promise<HostingerSendAttachment[]> {
  const { data: records } = await supabase.from("email_attachments").select("*").in("id", attachmentIds);
  const attachments: HostingerSendAttachment[] = [];
  for (const record of records ?? []) {
    const { data: fileData, error } = await supabase.storage.from(record.storage_bucket).download(record.storage_path);
    if (error || !fileData) continue;
    const buffer = Buffer.from(await fileData.arrayBuffer());
    attachments.push({ filename: record.filename, content: buffer.toString("base64"), contentType: record.content_type ?? undefined });
  }
  return attachments;
}

// Resolves a live mailbox message (folder+uid, as browsed straight from
// Hostinger) into our internal thread, syncing it into email_messages if
// it isn't already, then redirects into the conversation view. This is how
// "browse the live INBOX" and "our internal thread grouping" meet — the
// admin never needs to know which came first.
export async function openMailboxMessage(folder: string, uid: number) {
  const supabase = await createClient();
  const mailboxResourceId = await getMailboxResourceId(supabase);

  const message = await getMessage(mailboxResourceId, folder, uid);
  const { threadId } = await syncInboundMessage(supabase, mailboxResourceId, message, false);

  if (message.unseen) {
    await markRead(mailboxResourceId, folder, uid).catch(() => {});
    await supabase.from("email_messages").update({ is_read: true }).eq("folder", folder).eq("hostinger_uid", uid);
  }

  redirect(`/admin/email-center/inbox/${threadId}`);
}

export async function markThreadRead(threadId: string, read: boolean) {
  const supabase = await createClient();
  const mailboxResourceId = await getMailboxResourceId(supabase);

  const { data: messages } = await supabase
    .from("email_messages")
    .select("folder, hostinger_uid")
    .eq("thread_id", threadId)
    .eq("direction", "inbound")
    .not("hostinger_uid", "is", null);

  for (const m of messages ?? []) {
    if (!m.folder || m.hostinger_uid === null) continue;
    await (read ? markRead : markUnread)(mailboxResourceId, m.folder, m.hostinger_uid).catch(() => {});
  }

  await supabase.from("email_messages").update({ is_read: read }).eq("thread_id", threadId).eq("direction", "inbound");
  await supabase.from("email_threads").update({ is_unread: !read }).eq("id", threadId);

  revalidatePath(`/admin/email-center/inbox/${threadId}`);
  revalidatePath("/admin/email-center/inbox");
}

export async function archiveThread(threadId: string, targetFolder = "INBOX.Archive") {
  const supabase = await createClient();
  const mailboxResourceId = await getMailboxResourceId(supabase);

  const { data: messages } = await supabase
    .from("email_messages")
    .select("folder, hostinger_uid")
    .eq("thread_id", threadId)
    .eq("direction", "inbound")
    .not("hostinger_uid", "is", null);

  for (const m of messages ?? []) {
    if (!m.folder || m.hostinger_uid === null) continue;
    await moveMessage(mailboxResourceId, m.folder, m.hostinger_uid, targetFolder).catch(() => {});
  }

  await supabase.from("email_threads").update({ status: "archived" }).eq("id", threadId);

  revalidatePath("/admin/email-center/inbox");
  redirect("/admin/email-center/inbox");
}

export async function deleteThreadMessages(threadId: string) {
  const supabase = await createClient();
  const mailboxResourceId = await getMailboxResourceId(supabase);

  const { data: messages } = await supabase
    .from("email_messages")
    .select("folder, hostinger_uid")
    .eq("thread_id", threadId)
    .eq("direction", "inbound")
    .not("hostinger_uid", "is", null);

  for (const m of messages ?? []) {
    if (!m.folder || m.hostinger_uid === null) continue;
    await deleteHostingerMessage(mailboxResourceId, m.folder, m.hostinger_uid).catch(() => {});
  }

  await supabase.from("email_messages").delete().eq("thread_id", threadId);
  await supabase.from("email_threads").delete().eq("id", threadId);

  revalidatePath("/admin/email-center/inbox");
  redirect("/admin/email-center/inbox");
}

// Handles reply / reply-all / forward / a fresh compose from the thread
// view — all funnel through one sendEmail call. See docs/EMAIL_CENTER.md:
// the Hostinger send API has no In-Reply-To/References field, so this does
// NOT produce RFC5322-threaded mail in the recipient's client; it's grouped
// only in our own thread view via subject+contact matching.
export async function sendThreadReply(threadId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const to = String(formData.get("to") || "").split(",").map((e) => e.trim()).filter(Boolean);
  const cc = String(formData.get("cc") || "").split(",").map((e) => e.trim()).filter(Boolean);
  const bcc = String(formData.get("bcc") || "").split(",").map((e) => e.trim()).filter(Boolean);
  const subject = String(formData.get("subject") || "").trim();
  const html = sanitizeComposedHtml(String(formData.get("html") || ""));
  const attachmentIds = formData.getAll("attachment_ids").map(String);

  if (to.length === 0 || !subject || !html) throw new Error("To, subject, and body are required.");

  const mailboxResourceId = await getMailboxResourceId(supabase);
  const sentAt = new Date();

  const attachments = attachmentIds.length > 0 ? await loadReplyAttachments(supabase, attachmentIds) : undefined;

  await sendEmail(mailboxResourceId, { to, cc: cc.length ? cc : undefined, bcc: bcc.length ? bcc : undefined, subject, html, text: stripHtmlToText(html), attachments });

  await supabase.from("email_messages").insert({
    thread_id: threadId,
    direction: "outbound",
    subject,
    body_html: html,
    body_text: stripHtmlToText(html),
    from_email: process.env.HOSTINGER_MAILBOX ?? "",
    to_emails: to,
    cc_emails: cc,
    bcc_emails: bcc,
    is_read: true,
    message_date: sentAt.toISOString(),
    created_by: user?.id ?? null,
  });

  await touchThread(supabase, threadId, { lastMessageAt: sentAt, preview: stripHtmlToText(html).slice(0, 200), markUnread: false });

  await logActivity(supabase, { actorType: "user", actorId: user?.id, action: "inbox.reply_sent", entityType: "email_thread", entityId: threadId, metadata: { to: to.join(",") } });

  revalidatePath(`/admin/email-center/inbox/${threadId}`);
}

export async function saveThreadDraft(threadId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const to = String(formData.get("to") || "").split(",").map((e) => e.trim()).filter(Boolean);
  const subject = String(formData.get("subject") || "").trim();
  const html = sanitizeComposedHtml(String(formData.get("html") || ""));

  await supabase.from("email_messages").insert({
    thread_id: threadId,
    direction: "outbound",
    subject,
    body_html: html,
    body_text: stripHtmlToText(html),
    from_email: process.env.HOSTINGER_MAILBOX ?? "",
    to_emails: to,
    is_read: true,
    is_draft: true,
    message_date: new Date().toISOString(),
    created_by: user?.id ?? null,
  });

  revalidatePath(`/admin/email-center/inbox/${threadId}`);
}

// Fresh outbound message (not a reply to an existing thread) — creates a
// new email_threads row and sends. Uses the same thread-matching lookup as
// replies would, so if a matching open thread with this recipient+subject
// already exists within the freshness window it's reused instead of
// duplicated.
export async function sendNewMessage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const to = String(formData.get("to") || "").split(",").map((e) => e.trim()).filter(Boolean);
  const cc = String(formData.get("cc") || "").split(",").map((e) => e.trim()).filter(Boolean);
  const bcc = String(formData.get("bcc") || "").split(",").map((e) => e.trim()).filter(Boolean);
  const subject = String(formData.get("subject") || "").trim();
  const html = sanitizeComposedHtml(String(formData.get("html") || ""));
  const attachmentIds = formData.getAll("attachment_ids").map(String);

  if (to.length === 0 || !subject || !html) throw new Error("To, subject, and body are required.");

  const mailboxResourceId = await getMailboxResourceId(supabase);
  const sentAt = new Date();
  const attachments = attachmentIds.length > 0 ? await loadReplyAttachments(supabase, attachmentIds) : undefined;

  await sendEmail(mailboxResourceId, { to, cc: cc.length ? cc : undefined, bcc: bcc.length ? bcc : undefined, subject, html, text: stripHtmlToText(html), attachments });

  const primaryEmail = to[0];
  const { data: contact } = await supabase.from("email_contacts").select("id").eq("email_normalized", primaryEmail.toLowerCase().trim()).maybeSingle();

  const thread = await findOrCreateThread(supabase, { contactId: contact?.id ?? null, contactEmail: primaryEmail, subject, messageDate: sentAt });

  await supabase.from("email_messages").insert({
    thread_id: thread.id,
    direction: "outbound",
    subject,
    body_html: html,
    body_text: stripHtmlToText(html),
    from_email: process.env.HOSTINGER_MAILBOX ?? "",
    to_emails: to,
    cc_emails: cc,
    bcc_emails: bcc,
    is_read: true,
    message_date: sentAt.toISOString(),
    created_by: user?.id ?? null,
  });

  await touchThread(supabase, thread.id, { lastMessageAt: sentAt, preview: stripHtmlToText(html).slice(0, 200), markUnread: false });
  await logActivity(supabase, { actorType: "user", actorId: user?.id, action: "inbox.message_sent", entityType: "email_thread", entityId: thread.id, metadata: { to: to.join(",") } });

  revalidatePath("/admin/email-center/inbox");
  redirect(`/admin/email-center/inbox/${thread.id}`);
}
