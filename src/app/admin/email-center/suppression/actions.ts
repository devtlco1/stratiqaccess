"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/email/activityLog";
import { isValidEmail, normalizeEmail } from "@/lib/email/contactImport";
import type { SuppressionReason } from "@/lib/email/dbTypes";

const REASONS: SuppressionReason[] = ["unsubscribed", "bounced_hard", "bounced_soft", "complaint", "manual", "invalid"];

export async function addSuppression(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = String(formData.get("email") || "").trim();
  const reason = String(formData.get("reason") || "manual");
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!email || !isValidEmail(email)) throw new Error("Enter a valid email address.");

  const { error } = await supabase.from("email_suppression_list").upsert(
    {
      email_normalized: normalizeEmail(email),
      original_email: email,
      reason: (REASONS.includes(reason as SuppressionReason) ? reason : "manual") as SuppressionReason,
      source: "manual_admin_entry",
      notes,
      is_active: true,
      created_by: user?.id ?? null,
      restored_at: null,
      restored_by: null,
    },
    { onConflict: "email_normalized" }
  );
  if (error) throw new Error(error.message);

  await supabase.from("email_contacts").update({ status: "suppressed", is_subscribed: false }).eq("email_normalized", normalizeEmail(email));

  await logActivity(supabase, { actorType: "user", actorId: user?.id, action: "suppression.added", entityType: "email_suppression_list", metadata: { email } });

  revalidatePath("/admin/email-center/suppression");
}

export async function restoreSuppression(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: suppression } = await supabase.from("email_suppression_list").select("email_normalized").eq("id", id).single();
  if (!suppression) throw new Error("Suppression entry not found.");

  const { error } = await supabase
    .from("email_suppression_list")
    .update({ is_active: false, restored_at: new Date().toISOString(), restored_by: user?.id ?? null })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await supabase.from("email_contacts").update({ status: "active", is_subscribed: true, unsubscribed_at: null }).eq("email_normalized", suppression.email_normalized);

  await logActivity(supabase, { actorType: "user", actorId: user?.id, action: "suppression.restored", entityType: "email_suppression_list", entityId: id });

  revalidatePath("/admin/email-center/suppression");
}
