"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/email/activityLog";
import { getCurrentAccount, getMailboxResourceId, getQuota } from "@/lib/hostinger/mailbox";
import { createWebhook, listWebhooks, regenerateWebhookSecret } from "@/lib/hostinger/webhooks";
import { HostingerApiError } from "@/lib/hostinger/types";

export interface ConnectionTestResult {
  ok: boolean;
  mailboxAddress?: string;
  quotaUsedMb?: number;
  quotaLimitMb?: number;
  error?: string;
}

export async function testHostingerConnection(): Promise<ConnectionTestResult> {
  const supabase = await createClient();
  try {
    const account = await getCurrentAccount();
    const mailbox = account.mailboxes.find((m) => m.address.toLowerCase() === (process.env.HOSTINGER_MAILBOX || "").toLowerCase());
    if (!mailbox) throw new Error(`HOSTINGER_MAILBOX not found among this token's mailboxes.`);

    const quota = await getQuota(mailbox.resourceId);
    const result: ConnectionTestResult = {
      ok: true,
      mailboxAddress: mailbox.address,
      quotaUsedMb: Math.round(quota.totalUsage / (1024 * 1024)),
      quotaLimitMb: Math.round(quota.totalLimit / (1024 * 1024)),
    };

    await supabase.from("email_settings").upsert([
      { key: "last_sync_status", value: "ok", description: "Result of the last manual connection test." },
      { key: "last_sync_at", value: new Date().toISOString(), description: "Timestamp of the last manual connection test." },
    ]);

    return result;
  } catch (error) {
    const message = error instanceof HostingerApiError ? `${error.code}: ${error.message}` : error instanceof Error ? error.message : "Unknown error";
    await supabase.from("email_settings").upsert([
      { key: "last_sync_status", value: "error", description: "Result of the last manual connection test." },
      { key: "last_sync_at", value: new Date().toISOString(), description: "Timestamp of the last manual connection test." },
    ]);
    return { ok: false, error: message };
  }
}

export interface WebhookRegistrationResult {
  ok: boolean;
  secret?: string;
  error?: string;
}

export async function registerOrRotateWebhook(): Promise<WebhookRegistrationResult> {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!siteUrl) return { ok: false, error: "NEXT_PUBLIC_SITE_URL is not configured." };

  const webhookUrl = `${siteUrl}/api/webhooks/hostinger-email`;

  try {
    const mailboxResourceId = await getMailboxResourceId(supabase);
    const existing = await listWebhooks(mailboxResourceId);
    const ours = existing.find((w) => w.url === webhookUrl);

    const result = ours
      ? await regenerateWebhookSecret(mailboxResourceId, ours.id)
      : await createWebhook(mailboxResourceId, { name: "Email Center", description: "STRATIQ Access admin dashboard", events: ["message.received"], status: "active", url: webhookUrl });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    await logActivity(supabase, { actorType: "user", actorId: user?.id, action: ours ? "webhook.secret_rotated" : "webhook.registered", entityType: "email_webhook_config", metadata: { url: webhookUrl } });

    revalidatePath("/admin/email-center/settings");
    return { ok: true, secret: result.secret };
  } catch (error) {
    const message = error instanceof HostingerApiError ? `${error.code}: ${error.message}` : error instanceof Error ? error.message : "Unknown error";
    return { ok: false, error: message };
  }
}

export async function updateQueueSettings(formData: FormData) {
  const supabase = await createClient();

  const batchSize = Number(formData.get("default_batch_size")) || 20;
  const intervalSeconds = Number(formData.get("default_send_interval_seconds")) || 120;
  const attachmentLimitMb = Number(formData.get("attachment_limit_mb")) || 25;
  const fallbackEnabled = formData.get("fallback_salutation_enabled") === "on";
  const fallbackText = String(formData.get("fallback_salutation_text") || "Sir/Madam").trim();

  await supabase.from("email_settings").upsert([
    { key: "default_batch_size", value: batchSize, description: "Default recipients processed per cron run for new campaigns." },
    { key: "default_send_interval_seconds", value: intervalSeconds, description: "Default seconds between cron runs assumed for new campaigns' batch estimates." },
    { key: "attachment_limit_mb", value: attachmentLimitMb, description: "Admin-configured safety threshold — not an official Hostinger limit." },
    { key: "fallback_salutation_enabled", value: fallbackEnabled, description: "Whether {{name}} may fall back to a generic salutation when a contact has no name." },
    { key: "fallback_salutation_text", value: fallbackText, description: "Fallback text used for {{name}}/{{first_name}} when enabled." },
  ]);

  revalidatePath("/admin/email-center/settings");
}
