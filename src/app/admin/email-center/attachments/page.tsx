import { AdminShell } from "@/components/admin/AdminShell";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import type { EmailAttachmentRow } from "@/lib/email/dbTypes";
import { formatBytes } from "@/lib/email/attachmentValidation";
import { EmailCenterNav } from "../EmailCenterNav";
import { uploadAttachment, replaceAttachment, deleteAttachment } from "./actions";

export default async function AttachmentsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("email_attachments").select("*").order("created_at", { ascending: false });
  const attachments = (data ?? []) as EmailAttachmentRow[];

  const signedUrls = new Map<string, string>();
  await Promise.all(
    attachments.map(async (a) => {
      const { data: signed } = await supabase.storage.from(a.storage_bucket).createSignedUrl(a.storage_path, 60 * 10);
      if (signed?.signedUrl) signedUrls.set(a.id, signed.signedUrl);
    })
  );

  return (
    <AdminShell>
      <EmailCenterNav active="/admin/email-center/attachments" />
      <h1 className="font-display text-2xl text-navy">Attachments</h1>
      <p className="mt-2 text-sm text-ink/60">
        Reusable files for templates, campaigns, and replies — stored in a private bucket, only ever exposed via short-lived signed links.
      </p>

      <form action={uploadAttachment} className="mt-6 flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
        <input type="file" name="file" required className="text-sm" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.rtf,.jpg,.jpeg,.png,.gif,.webp" />
        <SubmitButton size="sm">Upload</SubmitButton>
      </form>

      <div className="mt-6 flex flex-col gap-3">
        {attachments.length === 0 && <p className="text-sm text-ink/60">No attachments yet.</p>}
        {attachments.map((attachment) => {
          const deleteWithId = deleteAttachment.bind(null, attachment.id);
          const replaceWithId = replaceAttachment.bind(null, attachment.id);
          return (
            <div key={attachment.id} className="flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
              <div className="flex-1 min-w-[200px]">
                <p className="font-medium text-navy">{attachment.filename}</p>
                <p className="text-xs text-ink/50">
                  {formatBytes(attachment.size_bytes)} · {attachment.content_type || "unknown type"} · uploaded {new Date(attachment.created_at).toLocaleDateString()}
                </p>
              </div>
              {signedUrls.has(attachment.id) && (
                <a href={signedUrls.get(attachment.id)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-stratiq-blue hover:text-navy">
                  Preview / Download
                </a>
              )}
              <form action={replaceWithId} className="flex items-center gap-2">
                <input type="file" name="file" required className="w-40 text-xs" />
                <button type="submit" className="text-xs font-semibold uppercase tracking-wide text-navy hover:text-stratiq-blue">Replace</button>
              </form>
              <form action={deleteWithId}>
                <ConfirmSubmitButton size="sm" variant="danger" confirmMessage={`Delete "${attachment.filename}"? Any template or campaign referencing it will no longer include it.`}>
                  Delete
                </ConfirmSubmitButton>
              </form>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
