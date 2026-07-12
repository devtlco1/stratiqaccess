"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/email/activityLog";
import { sanitizeComposedHtml, stripHtmlToText } from "@/lib/email/sanitizeHtml";
import { buildVariableContext, extractVariables, renderEmail } from "@/lib/email/templateVariables";
import { buildUnsubscribeUrl } from "@/lib/email/unsubscribeToken";
import { getMailboxResourceId } from "@/lib/hostinger/mailbox";
import { sendEmail } from "@/lib/hostinger/send";
import type { EmailContactRow } from "@/lib/email/dbTypes";

function readForm(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    description: String(formData.get("description") || "").trim() || null,
    subject: String(formData.get("subject") || "").trim(),
    html_body: sanitizeComposedHtml(String(formData.get("html_body") || "")),
    text_body: String(formData.get("text_body") || "").trim() || null,
    default_language: String(formData.get("default_language") || "en").trim() || "en",
    is_active: formData.get("is_active") === "on",
  };
}

export async function createTemplate(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const fields = readForm(formData);
  if (!fields.name || !fields.subject || !fields.html_body) {
    throw new Error("Name, subject, and body are required.");
  }

  const variables = Array.from(new Set([...extractVariables(fields.subject), ...extractVariables(fields.html_body)]));

  const { data, error } = await supabase
    .from("email_templates")
    .insert({ ...fields, variables, created_by: user?.id ?? null })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, { actorType: "user", actorId: user?.id, action: "template.created", entityType: "email_template", entityId: data.id, metadata: { name: fields.name } });

  revalidatePath("/admin/email-center/templates");
  redirect(`/admin/email-center/templates/${data.id}`);
}

export async function updateTemplate(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const fields = readForm(formData);
  if (!fields.name || !fields.subject || !fields.html_body) {
    throw new Error("Name, subject, and body are required.");
  }

  const variables = Array.from(new Set([...extractVariables(fields.subject), ...extractVariables(fields.html_body)]));

  const { error } = await supabase.from("email_templates").update({ ...fields, variables }).eq("id", id);
  if (error) throw new Error(error.message);

  await logActivity(supabase, { actorType: "user", actorId: user?.id, action: "template.updated", entityType: "email_template", entityId: id });

  revalidatePath("/admin/email-center/templates");
  redirect(`/admin/email-center/templates/${id}`);
}

export async function deleteTemplate(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("email_templates").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/email-center/templates");
  redirect("/admin/email-center/templates");
}

export async function duplicateTemplate(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: original, error: fetchError } = await supabase.from("email_templates").select("*").eq("id", id).single();
  if (fetchError || !original) throw new Error(fetchError?.message ?? "Template not found.");

  const { data, error } = await supabase
    .from("email_templates")
    .insert({
      name: `${original.name} (Copy)`,
      description: original.description,
      subject: original.subject,
      html_body: original.html_body,
      text_body: original.text_body,
      default_language: original.default_language,
      variables: original.variables,
      is_active: false,
      created_by: user?.id ?? null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath("/admin/email-center/templates");
  redirect(`/admin/email-center/templates/${data.id}`);
}

export interface PreviewResult {
  subject: string;
  html: string;
  text: string;
  missingVariables: string[];
  fallbacksUsed: string[];
}

export async function previewTemplate(
  subject: string,
  htmlBody: string,
  textBody: string | null,
  contactId: string | null
): Promise<PreviewResult> {
  const supabase = await createClient();
  let contact: EmailContactRow | null = null;
  if (contactId) {
    const { data } = await supabase.from("email_contacts").select("*").eq("id", contactId).single();
    contact = data as EmailContactRow | null;
  }

  const context = contact
    ? buildVariableContext(contact, "STRATIQ Access", buildUnsubscribeUrl(contact.id))
    : buildVariableContext(
        { name: "Sample Contact", company_name: "Sample Company", email: "sample@example.com", job_title: "Director", sector: "Energy", country: "UAE", website: "example.com" },
        "STRATIQ Access",
        `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/unsubscribe?token=sample`
      );

  const rendered = renderEmail({ subject, html: htmlBody, text: textBody }, context);
  return {
    subject: rendered.subject,
    html: sanitizeComposedHtml(rendered.html),
    text: rendered.text ?? stripHtmlToText(rendered.html),
    missingVariables: rendered.missingVariables,
    fallbacksUsed: rendered.fallbacksUsed,
  };
}

export async function sendTestTemplateEmail(
  subject: string,
  htmlBody: string,
  textBody: string | null,
  testEmail: string,
  contactId: string | null
): Promise<{ success: boolean; error?: string; missingVariables: string[] }> {
  if (!testEmail?.trim()) {
    return { success: false, error: "Enter an administrator email address to send the test to.", missingVariables: [] };
  }

  const preview = await previewTemplate(subject, htmlBody, textBody, contactId);
  if (preview.missingVariables.length > 0) {
    return {
      success: false,
      error: `Unresolved variables: ${preview.missingVariables.join(", ")}. Fix these before sending.`,
      missingVariables: preview.missingVariables,
    };
  }

  try {
    const supabase = await createClient();
    const mailboxResourceId = await getMailboxResourceId(supabase);
    await sendEmail(mailboxResourceId, {
      to: [testEmail.trim()],
      subject: `[TEST] ${preview.subject}`,
      html: preview.html,
      text: preview.text,
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    await logActivity(supabase, {
      actorType: "user",
      actorId: user?.id,
      action: "template.test_sent",
      entityType: "email_template",
      metadata: { testEmail: testEmail.trim(), subject: preview.subject },
    });

    return { success: true, missingVariables: [] };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to send test email.", missingVariables: [] };
  }
}

export async function attachToTemplate(formData: FormData) {
  const supabase = await createClient();
  const templateId = String(formData.get("template_id") || "");
  const attachmentId = String(formData.get("attachment_id") || "");
  if (!templateId || !attachmentId) return;

  const { error } = await supabase
    .from("email_template_attachments")
    .upsert({ template_id: templateId, attachment_id: attachmentId }, { onConflict: "template_id,attachment_id" });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/email-center/templates/${templateId}`);
}

export async function detachFromTemplate(templateId: string, attachmentId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("email_template_attachments")
    .delete()
    .eq("template_id", templateId)
    .eq("attachment_id", attachmentId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/email-center/templates/${templateId}`);
}
