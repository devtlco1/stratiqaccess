import { AdminShell } from "@/components/admin/AdminShell";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import { getMailboxResourceId } from "@/lib/hostinger/mailbox";
import { listWebhooks } from "@/lib/hostinger/webhooks";
import { EmailCenterNav } from "../EmailCenterNav";
import { HealthPanel } from "./HealthPanel";
import { updateQueueSettings } from "./actions";

export default async function EmailCenterSettingsPage() {
  const supabase = await createClient();

  const [{ data: settingsRows }, { data: lastWebhookEvent }] = await Promise.all([
    supabase.from("email_settings").select("key, value"),
    supabase.from("email_webhook_events").select("received_at").order("received_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const settings = Object.fromEntries((settingsRows ?? []).map((r) => [r.key, r.value])) as Record<string, unknown>;

  let webhookRegisteredOnHostinger = false;
  try {
    const mailboxResourceId = await getMailboxResourceId(supabase);
    const webhooks = await listWebhooks(mailboxResourceId);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    webhookRegisteredOnHostinger = webhooks.some((w) => w.url === `${siteUrl}/api/webhooks/hostinger-email` && w.status === "active");
  } catch {
    // Connection health panel surfaces this — settings page itself stays usable.
  }

  return (
    <AdminShell>
      <EmailCenterNav active="/admin/email-center/settings" />
      <h1 className="font-display text-2xl text-navy">Email Center Settings</h1>
      <p className="mt-2 text-sm text-ink/60">
        This page only ever shows whether configuration is present and valid — API tokens and secrets are never displayed here.
      </p>

      <div className="mt-6">
        <HealthPanel
          tokenConfigured={!!process.env.HOSTINGER_MAIL_API_TOKEN}
          webhookSecretConfigured={!!process.env.HOSTINGER_WEBHOOK_SECRET}
          lastSyncStatus={typeof settings.last_sync_status === "string" ? settings.last_sync_status : null}
          lastSyncAt={typeof settings.last_sync_at === "string" ? settings.last_sync_at : null}
          lastWebhookAt={lastWebhookEvent?.received_at ?? null}
          webhookRegisteredOnHostinger={webhookRegisteredOnHostinger}
        />
      </div>

      <div className="mt-8 max-w-xl rounded-xl bg-white p-5 shadow-sm">
        <h2 className="font-display text-base text-navy">Queue &amp; Attachment Defaults</h2>
        <form action={updateQueueSettings} className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink/70 mb-1">Default batch size</label>
              <input type="number" name="default_batch_size" min={1} max={100} defaultValue={Number(settings.default_batch_size) || 20} className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/70 mb-1">Cron interval (seconds)</label>
              <input type="number" name="default_send_interval_seconds" min={0} defaultValue={Number(settings.default_send_interval_seconds) || 120} className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1">
              Attachment size warning threshold (MB) — not an official Hostinger limit, admin-configurable
            </label>
            <input type="number" name="attachment_limit_mb" min={1} defaultValue={Number(settings.attachment_limit_mb) || 25} className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm text-ink/80">
            <input type="checkbox" name="fallback_salutation_enabled" defaultChecked={!!settings.fallback_salutation_enabled} className="size-4 rounded border-navy/30" />
            Allow a fallback salutation when a contact has no name
          </label>
          <div>
            <label className="block text-xs font-medium text-ink/70 mb-1">Fallback text</label>
            <input name="fallback_salutation_text" defaultValue={typeof settings.fallback_salutation_text === "string" ? settings.fallback_salutation_text : "Sir/Madam"} className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm" />
          </div>
          <SubmitButton size="sm">Save Settings</SubmitButton>
        </form>
      </div>
    </AdminShell>
  );
}
