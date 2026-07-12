"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { stripHtmlToText } from "@/lib/email/sanitizeHtml";
import { touchThread } from "@/lib/email/threadMatching";
import { getMailboxResourceId } from "@/lib/hostinger/mailbox";
import { sendEmail } from "@/lib/hostinger/send";

export async function sendDraftNow(draftId: string) {
  const supabase = await createClient();
  const { data: draft } = await supabase.from("email_messages").select("*").eq("id", draftId).eq("is_draft", true).single();
  if (!draft) throw new Error("Draft not found.");
  if (draft.to_emails.length === 0 || !draft.subject) throw new Error("Draft needs at least a recipient and subject before sending.");

  const mailboxResourceId = await getMailboxResourceId(supabase);
  const sentAt = new Date();

  await sendEmail(mailboxResourceId, {
    to: draft.to_emails,
    cc: draft.cc_emails.length ? draft.cc_emails : undefined,
    bcc: draft.bcc_emails.length ? draft.bcc_emails : undefined,
    subject: draft.subject,
    html: draft.body_html ?? "",
    text: draft.body_text ?? stripHtmlToText(draft.body_html ?? ""),
  });

  await supabase.from("email_messages").update({ is_draft: false, message_date: sentAt.toISOString() }).eq("id", draftId);
  await touchThread(supabase, draft.thread_id, { lastMessageAt: sentAt, preview: (draft.body_text ?? "").slice(0, 200), markUnread: false });

  revalidatePath("/admin/email-center/drafts");
  revalidatePath(`/admin/email-center/inbox/${draft.thread_id}`);
}

export async function deleteDraft(draftId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("email_messages").delete().eq("id", draftId).eq("is_draft", true);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/email-center/drafts");
}
