"use server";

import { createClient } from "@/lib/supabase/server";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  errorCode?: "missingFields" | "server";
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const supabase = await createClient();

  const fields = {
    first_name: String(formData.get("firstName") || ""),
    last_name: String(formData.get("lastName") || ""),
    job_title: String(formData.get("jobTitle") || "") || null,
    company_name: String(formData.get("companyName") || ""),
    country: String(formData.get("country") || ""),
    phone: String(formData.get("phone") || "") || null,
    email: String(formData.get("email") || ""),
    message: String(formData.get("message") || ""),
  };

  if (!fields.first_name || !fields.last_name || !fields.company_name || !fields.country || !fields.email || !fields.message) {
    return { status: "error", errorCode: "missingFields" };
  }

  // Stores the raw storage path, not a signed URL — the anon visitor submitting
  // this form can't satisfy the "admin read" RLS policy needed to sign a URL.
  // The admin inbox signs a fresh (long-lived) URL at view time instead.
  let rfpFilePath: string | null = null;
  let attachment: { filename: string; content: Buffer; contentType: string } | null = null;

  const rfpFile = formData.get("rfpFiles") as File | null;
  if (rfpFile && rfpFile.size > 0) {
    const arrayBuffer = await rfpFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Attach directly to the notification email so it lands in the inbox
    // (not just a link) — kept under ~8MB to stay well within email size limits.
    if (buffer.byteLength <= 8 * 1024 * 1024) {
      attachment = { filename: rfpFile.name, content: buffer, contentType: rfpFile.type };
    }

    const path = `${Date.now()}-${rfpFile.name}`;
    const { error: uploadError } = await supabase.storage.from("rfp-files").upload(path, rfpFile, {
      contentType: rfpFile.type,
    });
    if (!uploadError) rfpFilePath = path;
  }

  const { error } = await supabase.from("messages").insert({
    ...fields,
    rfp_file_url: rfpFilePath,
  });

  if (error) {
    return { status: "error", errorCode: "server" };
  }

  await sendNotificationEmail(fields, attachment);

  return { status: "success" };
}

async function sendNotificationEmail(
  fields: {
    first_name: string;
    last_name: string;
    job_title: string | null;
    company_name: string;
    country: string;
    phone: string | null;
    email: string;
    message: string;
  },
  attachment: { filename: string; content: Buffer; contentType: string } | null
) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_NOTIFICATION_EMAIL;
  if (!apiKey || !to) return; // not configured yet — message is still saved in the admin inbox

  const rows: [string, string | null][] = [
    ["First Name", fields.first_name],
    ["Last Name", fields.last_name],
    ["Job Title", fields.job_title],
    ["Company", fields.company_name],
    ["Country", fields.country],
    ["Phone", fields.phone],
    ["Email", fields.email],
  ];

  const text = [
    ...rows.map(([label, value]) => `${label}: ${value || "—"}`),
    "",
    "Message:",
    fields.message,
    "",
    "View in admin: /admin/messages",
  ].join("\n");

  const html = `
    <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
      ${rows
        .map(
          ([label, value]) =>
            `<tr><td style="padding:4px 12px 4px 0;color:#667;font-weight:600">${label}</td><td style="padding:4px 0">${value || "—"}</td></tr>`
        )
        .join("")}
    </table>
    <p style="font-family:sans-serif;font-size:14px;margin-top:16px"><strong>Message:</strong><br />${fields.message.replace(/\n/g, "<br />")}</p>
    <p style="font-family:sans-serif;font-size:12px;color:#888">View in admin: /admin/messages</p>
  `;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: "STRATIQ Access Website <notifications@stratiqaccess.com>",
      to,
      replyTo: fields.email,
      subject: `New contact form submission from ${fields.first_name} ${fields.last_name}`,
      text,
      html,
      attachments: attachment
        ? [{ filename: attachment.filename, content: attachment.content }]
        : undefined,
    });
  } catch {
    // email is best-effort — the message is already saved, so we don't fail the submission over this
  }
}
