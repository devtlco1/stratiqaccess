import { AdminShell } from "@/components/admin/AdminShell";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import type { EmailAttachmentRow, EmailContactRow } from "@/lib/email/dbTypes";
import { sendNewMessage } from "../actions";

export default async function ComposePage() {
  const supabase = await createClient();
  const [{ data: contactsData }, { data: attachmentsData }] = await Promise.all([
    supabase.from("email_contacts").select("*").order("name").limit(300),
    supabase.from("email_attachments").select("*").order("filename"),
  ]);
  const contacts = (contactsData ?? []) as EmailContactRow[];
  const attachments = (attachmentsData ?? []) as EmailAttachmentRow[];

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-navy">Compose</h1>

      <form action={sendNewMessage} className="mt-8 flex flex-col gap-4 max-w-2xl">
        <div>
          <label htmlFor="contact_select" className="block text-sm font-medium text-ink/80 mb-1.5">Contact (optional — fills To below)</label>
          <select id="contact_select" className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm" defaultValue="">
            <option value="">— Choose a contact —</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.email}>{c.name} ({c.email})</option>
            ))}
          </select>
        </div>
        <input name="to" required placeholder="To (comma separated)" className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm" />
        <input name="cc" placeholder="Cc (comma separated)" className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm" />
        <input name="bcc" placeholder="Bcc (comma separated)" className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm" />
        <input name="subject" required placeholder="Subject" className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm" />
        <textarea name="html" required rows={12} placeholder="Message" className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm font-mono" />

        {attachments.length > 0 && (
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/50 mb-1.5">Attachments</p>
            <div className="flex flex-wrap gap-3">
              {attachments.map((a) => (
                <label key={a.id} className="flex items-center gap-1.5 text-xs text-ink/80">
                  <input type="checkbox" name="attachment_ids" value={a.id} className="size-3.5 rounded border-navy/30" />
                  {a.filename}
                </label>
              ))}
            </div>
          </div>
        )}

        <SubmitButton>Send</SubmitButton>
      </form>
    </AdminShell>
  );
}
