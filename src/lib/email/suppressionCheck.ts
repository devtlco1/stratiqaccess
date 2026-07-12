import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeEmail } from "./contactImport";

// Checked immediately before every actual send (queue processor, template
// test send, campaign test send) — not just at campaign creation/enqueue
// time — so a suppression added after a campaign was queued still takes
// effect before the email actually goes out.
export async function isSuppressed(supabase: SupabaseClient, email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const { data } = await supabase
    .from("email_suppression_list")
    .select("id")
    .eq("email_normalized", normalized)
    .eq("is_active", true)
    .maybeSingle();
  return !!data;
}
