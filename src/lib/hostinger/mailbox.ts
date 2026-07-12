import type { SupabaseClient } from "@supabase/supabase-js";
import { hostingerRequest } from "./client";
import type { HostingerAccount, HostingerQuota } from "./types";

export async function getCurrentAccount(): Promise<HostingerAccount> {
  return hostingerRequest<HostingerAccount>("/api/v1/me");
}

// mailboxResourceId rarely changes, so it's cached in email_settings after
// the first lookup rather than calling GET /me on every request. Accepts
// whichever Supabase client the caller already has (cookie-bound admin
// client or the service-role client) rather than importing one directly,
// so this module works identically from Server Actions and route handlers.
export async function getMailboxResourceId(supabase: SupabaseClient): Promise<string> {
  const { data: cached } = await supabase
    .from("email_settings")
    .select("value")
    .eq("key", "mailbox_resource_id")
    .maybeSingle();

  if (cached?.value && typeof cached.value === "string") {
    return cached.value;
  }

  const account = await getCurrentAccount();
  const targetAddress = (process.env.HOSTINGER_MAILBOX || "").toLowerCase();
  const mailbox = account.mailboxes.find((m) => m.address.toLowerCase() === targetAddress);

  if (!mailbox) {
    throw new Error(
      `HOSTINGER_MAILBOX ("${process.env.HOSTINGER_MAILBOX}") was not found among the mailboxes this API token can manage.`
    );
  }

  await supabase.from("email_settings").upsert({
    key: "mailbox_resource_id",
    value: mailbox.resourceId,
    description: "Cached Hostinger mailboxResourceId for HOSTINGER_MAILBOX, resolved via GET /api/v1/me.",
  });

  return mailbox.resourceId;
}

export async function getQuota(mailboxResourceId: string): Promise<HostingerQuota> {
  return hostingerRequest<HostingerQuota>(`/api/v1/mailboxes/${mailboxResourceId}/quota`);
}
