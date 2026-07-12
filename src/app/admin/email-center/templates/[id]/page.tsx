import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createClient } from "@/lib/supabase/server";
import type { EmailAttachmentRow, EmailContactRow, EmailTemplateRow } from "@/lib/email/dbTypes";
import { TemplateEditor } from "../TemplateEditor";
import { updateTemplate, deleteTemplate, duplicateTemplate, attachToTemplate, detachFromTemplate } from "../actions";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: templateData }, { data: contactsData }, { data: allAttachments }, { data: linkedRows }] = await Promise.all([
    supabase.from("email_templates").select("*").eq("id", id).single(),
    supabase.from("email_contacts").select("*").order("name").limit(200),
    supabase.from("email_attachments").select("*").order("filename"),
    supabase.from("email_template_attachments").select("attachment_id").eq("template_id", id),
  ]);

  const template = templateData as EmailTemplateRow | null;
  if (!template) notFound();

  const contacts = (contactsData ?? []) as EmailContactRow[];
  const attachments = (allAttachments ?? []) as EmailAttachmentRow[];
  const linkedIds = new Set((linkedRows ?? []).map((r) => r.attachment_id));

  const updateWithId = updateTemplate.bind(null, id);
  const deleteWithId = deleteTemplate.bind(null, id);
  const duplicateWithId = duplicateTemplate.bind(null, id);

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Edit Template</h1>
        <div className="flex items-center gap-4">
          <form action={duplicateWithId}>
            <button type="submit" className="text-sm font-medium text-stratiq-blue hover:text-navy">Duplicate</button>
          </form>
          <form action={deleteWithId}>
            <ConfirmSubmitButton size="sm" variant="danger" confirmMessage={`Delete the template "${template.name}"? Campaigns already created from it keep their own copy of the content.`}>
              Delete
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      <TemplateEditor template={template} contacts={contacts} action={updateWithId} />

      <div className="mt-10 max-w-2xl">
        <h2 className="font-display text-lg text-navy">Attachments</h2>
        <p className="mt-1 text-sm text-ink/60">Attached files are sent automatically with every campaign that uses this template.</p>
        {attachments.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">
            No attachments in your library yet — upload files under Attachments first.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {attachments.map((attachment) => {
              const isLinked = linkedIds.has(attachment.id);
              const detachAction = detachFromTemplate.bind(null, id, attachment.id);
              return (
                <div key={attachment.id} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
                  <span className="text-sm text-navy">{attachment.filename}</span>
                  {isLinked ? (
                    <form action={detachAction}>
                      <button type="submit" className="text-xs font-semibold uppercase tracking-wide text-red-600 hover:text-red-800">Remove</button>
                    </form>
                  ) : (
                    <form action={attachToTemplate}>
                      <input type="hidden" name="template_id" value={id} />
                      <input type="hidden" name="attachment_id" value={attachment.id} />
                      <button type="submit" className="text-xs font-semibold uppercase tracking-wide text-stratiq-blue hover:text-navy">Attach</button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
