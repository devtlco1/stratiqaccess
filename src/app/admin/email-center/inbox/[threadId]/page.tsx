import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createClient } from "@/lib/supabase/server";
import type { EmailAttachmentRow, EmailCampaignRow, EmailContactRow, EmailMessageRow, EmailThreadRow } from "@/lib/email/dbTypes";
import { sanitizeReceivedHtml } from "@/lib/email/sanitizeHtml";
import { ComposeReplyForm } from "./ComposeReplyForm";
import { markThreadRead, archiveThread, deleteThreadMessages, sendThreadReply, saveThreadDraft } from "../actions";

export default async function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const { threadId } = await params;
  const supabase = await createClient();

  const [{ data: threadData }, { data: messagesData }, { data: attachmentsData }] = await Promise.all([
    supabase.from("email_threads").select("*").eq("id", threadId).single(),
    supabase.from("email_messages").select("*").eq("thread_id", threadId).eq("is_draft", false).order("message_date", { ascending: true }),
    supabase.from("email_attachments").select("*").order("filename"),
  ]);

  const thread = threadData as EmailThreadRow | null;
  if (!thread) notFound();

  const messages = (messagesData ?? []) as EmailMessageRow[];
  const attachments = (attachmentsData ?? []) as EmailAttachmentRow[];
  const lastMessage = messages[messages.length - 1] ?? null;

  let contact: EmailContactRow | null = null;
  if (thread.contact_id) {
    const { data } = await supabase.from("email_contacts").select("*").eq("id", thread.contact_id).single();
    contact = data as EmailContactRow | null;
  }

  let campaign: EmailCampaignRow | null = null;
  if (thread.campaign_id) {
    const { data } = await supabase.from("email_campaigns").select("*").eq("id", thread.campaign_id).single();
    campaign = data as EmailCampaignRow | null;
  }

  const markReadWithId = markThreadRead.bind(null, threadId, true);
  const markUnreadWithId = markThreadRead.bind(null, threadId, false);
  const archiveWithId = archiveThread.bind(null, threadId, "INBOX.Archive");
  const deleteWithId = deleteThreadMessages.bind(null, threadId);
  const sendReplyWithId = sendThreadReply.bind(null, threadId);
  const saveDraftWithId = saveThreadDraft.bind(null, threadId);

  return (
    <AdminShell>
      <div className="flex items-start justify-between gap-6">
        <div>
          <Link href="/admin/email-center/inbox" className="text-sm text-stratiq-blue hover:text-navy">← Inbox</Link>
          <h1 className="mt-1 font-display text-2xl text-navy">{lastMessage?.subject || "(no subject)"}</h1>
          <p className="text-sm text-ink/60">{thread.contact_email}</p>
        </div>
        <div className="flex items-center gap-3">
          <form action={thread.is_unread ? markReadWithId : markUnreadWithId}>
            <button type="submit" className="text-sm font-medium text-stratiq-blue hover:text-navy">
              Mark {thread.is_unread ? "read" : "unread"}
            </button>
          </form>
          <form action={archiveWithId}>
            <button type="submit" className="text-sm font-medium text-ink/60 hover:text-navy">Archive</button>
          </form>
          <form action={deleteWithId}>
            <ConfirmSubmitButton size="sm" variant="danger" confirmMessage="Permanently delete this entire conversation, including on the mail server? This cannot be undone.">
              Delete
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {messages.length === 0 && <p className="text-sm text-ink/60">No messages in this conversation yet.</p>}
          {messages.map((message) => (
            <div key={message.id} className={`rounded-xl p-5 shadow-sm ${message.direction === "inbound" ? "bg-white" : "bg-stratiq-blue/5"}`}>
              <div className="flex items-center justify-between text-xs text-ink/50">
                <span>
                  {message.direction === "inbound" ? message.from_name || message.from_email : "You"} · {message.direction === "inbound" ? "to " + message.to_emails.join(", ") : "to " + message.to_emails.join(", ")}
                </span>
                <span>{new Date(message.message_date).toLocaleString()}</span>
              </div>
              {message.body_html ? (
                <div className="mt-3 text-sm" dangerouslySetInnerHTML={{ __html: sanitizeReceivedHtml(message.body_html) }} />
              ) : (
                <p className="mt-3 whitespace-pre-wrap text-sm text-ink/80">{message.body_text || "(empty message)"}</p>
              )}
              {message.has_attachments && message.attachment_meta.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.attachment_meta.map((a) => (
                    <span key={a.id} className="rounded-full bg-paper px-2.5 py-1 text-xs text-ink/70">📎 {a.filename ?? "attachment"}</span>
                  ))}
                </div>
              )}
            </div>
          ))}

          <ComposeReplyForm
            lastMessage={lastMessage}
            ownAddress={process.env.HOSTINGER_MAILBOX ?? ""}
            attachments={attachments}
            sendAction={sendReplyWithId}
            draftAction={saveDraftWithId}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="font-display text-base text-navy">Contact</h2>
            {contact ? (
              <>
                <Link href={`/admin/email-center/contacts/${contact.id}`} className="mt-2 block text-sm font-medium text-stratiq-blue hover:text-navy">
                  {contact.name}
                </Link>
                <p className="text-sm text-ink/60">{[contact.company_name, contact.job_title].filter(Boolean).join(" · ") || "—"}</p>
                <p className="text-sm text-ink/60">{contact.country}</p>
              </>
            ) : (
              <p className="mt-2 text-sm text-ink/60">No matching contact record for {thread.contact_email}.</p>
            )}
          </div>

          {campaign && (
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="font-display text-base text-navy">Campaign</h2>
              <Link href={`/admin/email-center/campaigns/${campaign.id}`} className="mt-2 block text-sm font-medium text-stratiq-blue hover:text-navy">
                {campaign.name}
              </Link>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
