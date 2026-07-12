"use server";

import { createHash, randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/email/activityLog";
import { validateAttachmentFile } from "@/lib/email/attachmentValidation";

const BUCKET = "email-attachments";

export async function uploadAttachment(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Choose a file to upload.");

  const { data: settingRow } = await supabase.from("email_settings").select("value").eq("key", "attachment_limit_mb").maybeSingle();
  const maxSizeMb = typeof settingRow?.value === "number" ? settingRow.value : undefined;

  const validation = validateAttachmentFile(file, maxSizeMb);
  if (!validation.valid) throw new Error(validation.reason);

  const buffer = Buffer.from(await file.arrayBuffer());
  const checksum = createHash("sha256").update(buffer).digest("hex");
  const ext = file.name.split(".").pop() || "bin";
  const path = `${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { data, error } = await supabase
    .from("email_attachments")
    .insert({
      storage_bucket: BUCKET,
      storage_path: path,
      filename: file.name,
      content_type: file.type || null,
      size_bytes: file.size,
      checksum_sha256: checksum,
      uploaded_by: user?.id ?? null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    actorType: "user",
    actorId: user?.id,
    action: "attachment.uploaded",
    entityType: "email_attachment",
    entityId: data.id,
    metadata: { filename: file.name, sizeBytes: file.size },
  });

  revalidatePath("/admin/email-center/attachments");
}

export async function replaceAttachment(id: string, formData: FormData) {
  const supabase = await createClient();
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("Choose a replacement file.");

  const { data: settingRow } = await supabase.from("email_settings").select("value").eq("key", "attachment_limit_mb").maybeSingle();
  const maxSizeMb = typeof settingRow?.value === "number" ? settingRow.value : undefined;

  const validation = validateAttachmentFile(file, maxSizeMb);
  if (!validation.valid) throw new Error(validation.reason);

  const { data: existing } = await supabase.from("email_attachments").select("storage_path").eq("id", id).single();
  if (!existing) throw new Error("Attachment not found.");

  const buffer = Buffer.from(await file.arrayBuffer());
  const checksum = createHash("sha256").update(buffer).digest("hex");

  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(existing.storage_path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: true,
  });
  if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

  const { error } = await supabase
    .from("email_attachments")
    .update({ filename: file.name, content_type: file.type || null, size_bytes: file.size, checksum_sha256: checksum })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/email-center/attachments");
}

export async function deleteAttachment(id: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("email_attachments").select("storage_path").eq("id", id).single();

  const { error } = await supabase.from("email_attachments").delete().eq("id", id);
  if (error) throw new Error(error.message);

  if (existing) {
    await supabase.storage.from(BUCKET).remove([existing.storage_path]);
  }

  revalidatePath("/admin/email-center/attachments");
}
