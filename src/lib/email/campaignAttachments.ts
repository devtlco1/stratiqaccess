import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_ATTACHMENT_LIMIT_MB } from "./attachmentValidation";
import type { HostingerSendAttachment } from "@/lib/hostinger/types";

export async function getAttachmentLimitMb(supabase: SupabaseClient): Promise<number> {
  const { data } = await supabase.from("email_settings").select("value").eq("key", "attachment_limit_mb").maybeSingle();
  return typeof data?.value === "number" ? data.value : DEFAULT_ATTACHMENT_LIMIT_MB;
}

// Combines a template's permanently-attached files with a campaign's
// campaign-only attachments, downloads each from the private Storage
// bucket, and base64-encodes them for the Hostinger send payload (the API
// takes attachment bytes inline in the request body — there's no separate
// upload-then-reference step). Returns totalBytes/overLimit so callers can
// decide whether to block the send rather than silently truncating.
export async function loadCampaignAttachments(
  supabase: SupabaseClient,
  campaign: { id: string; template_id: string | null; attachment_ids: string[] }
): Promise<{ attachments: HostingerSendAttachment[]; totalBytes: number; overLimit: boolean; limitMb: number }> {
  const attachmentIds = new Set(campaign.attachment_ids);

  if (campaign.template_id) {
    const { data } = await supabase.from("email_template_attachments").select("attachment_id").eq("template_id", campaign.template_id);
    for (const row of data ?? []) attachmentIds.add(row.attachment_id);
  }

  const limitMb = await getAttachmentLimitMb(supabase);
  if (attachmentIds.size === 0) return { attachments: [], totalBytes: 0, overLimit: false, limitMb };

  const { data: records } = await supabase.from("email_attachments").select("*").in("id", Array.from(attachmentIds));
  const attachments: HostingerSendAttachment[] = [];
  let totalBytes = 0;

  for (const record of records ?? []) {
    const { data: fileData, error } = await supabase.storage.from(record.storage_bucket).download(record.storage_path);
    if (error || !fileData) continue;
    const buffer = Buffer.from(await fileData.arrayBuffer());
    totalBytes += buffer.byteLength;
    attachments.push({
      filename: record.filename,
      content: buffer.toString("base64"),
      contentType: record.content_type ?? undefined,
    });
  }

  return { attachments, totalBytes, overLimit: totalBytes > limitMb * 1024 * 1024, limitMb };
}
