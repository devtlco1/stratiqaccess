"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/admin/SubmitButton";
import type { EmailAttachmentRow, EmailMessageRow } from "@/lib/email/dbTypes";

type Mode = "reply" | "reply_all" | "forward";

export function ComposeReplyForm({
  lastMessage,
  ownAddress,
  attachments,
  sendAction,
  draftAction,
}: {
  lastMessage: EmailMessageRow | null;
  ownAddress: string;
  attachments: EmailAttachmentRow[];
  sendAction: (formData: FormData) => Promise<void>;
  draftAction: (formData: FormData) => Promise<void>;
}) {
  const [mode, setMode] = useState<Mode>("reply");
  const [open, setOpen] = useState(false);

  if (!lastMessage) return null;

  const replyTo = lastMessage.direction === "inbound" ? lastMessage.from_email : lastMessage.to_emails[0] ?? "";
  const replyAllRecipients = Array.from(
    new Set([lastMessage.from_email, ...lastMessage.to_emails, ...lastMessage.cc_emails].filter((e) => e && e !== ownAddress))
  );

  const defaults = {
    reply: { to: replyTo, subject: `Re: ${lastMessage.subject ?? ""}` },
    reply_all: { to: replyAllRecipients.join(", "), subject: `Re: ${lastMessage.subject ?? ""}` },
    forward: { to: "", subject: `Fwd: ${lastMessage.subject ?? ""}` },
  }[mode];

  const quotedBody = `<br/><br/><blockquote style="border-left:2px solid #ccc;padding-left:12px;color:#666;">${lastMessage.body_html ?? lastMessage.body_text ?? ""}</blockquote>`;

  if (!open) {
    return (
      <div className="mt-6 flex gap-3">
        <button onClick={() => { setMode("reply"); setOpen(true); }} className="rounded-md bg-stratiq-blue px-4 py-2 text-sm font-semibold text-white hover:bg-navy transition-colors">Reply</button>
        <button onClick={() => { setMode("reply_all"); setOpen(true); }} className="rounded-md border border-navy/15 px-4 py-2 text-sm font-semibold text-navy hover:bg-paper transition-colors">Reply All</button>
        <button onClick={() => { setMode("forward"); setOpen(true); }} className="rounded-md border border-navy/15 px-4 py-2 text-sm font-semibold text-navy hover:bg-paper transition-colors">Forward</button>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
      <p className="mb-3 rounded bg-amber-50 px-3 py-2 text-xs text-amber-800">
        This will not appear as a threaded reply in the recipient&rsquo;s own mail client (Hostinger&rsquo;s API doesn&rsquo;t support reply headers) — it groups here in the dashboard only.
      </p>
      <form
        action={sendAction}
        onSubmit={() => setOpen(false)}
        className="flex flex-col gap-3"
      >
        <input type="text" name="to" required defaultValue={defaults.to} placeholder="To (comma separated)" className="rounded-lg border border-navy/15 px-3 py-2 text-sm" />
        {mode === "reply_all" && (
          <input type="text" name="cc" placeholder="Cc (comma separated)" className="rounded-lg border border-navy/15 px-3 py-2 text-sm" />
        )}
        <input type="text" name="bcc" placeholder="Bcc (comma separated)" className="rounded-lg border border-navy/15 px-3 py-2 text-sm" />
        <input type="text" name="subject" required defaultValue={defaults.subject} placeholder="Subject" className="rounded-lg border border-navy/15 px-3 py-2 text-sm" />
        <textarea
          name="html"
          required
          rows={10}
          defaultValue={mode === "forward" ? quotedBody : ""}
          className="rounded-lg border border-navy/15 px-3 py-2 text-sm font-mono"
        />
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
        <div className="flex items-center gap-3">
          <SubmitButton size="sm">Send</SubmitButton>
          <button type="button" onClick={() => setOpen(false)} className="text-sm text-ink/60 hover:text-navy">Cancel</button>
          <button
            type="button"
            formAction={draftAction}
            className="text-sm font-medium text-stratiq-blue hover:text-navy"
          >
            Save Draft
          </button>
        </div>
      </form>
    </div>
  );
}
