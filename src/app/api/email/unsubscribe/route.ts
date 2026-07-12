import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { verifyUnsubscribeToken } from "@/lib/email/unsubscribeToken";
import { normalizeEmail } from "@/lib/email/contactImport";
import { logActivity } from "@/lib/email/activityLog";

function redirectTo(request: NextRequest, path: string): NextResponse {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const base = siteUrl || request.nextUrl.origin;
  return NextResponse.redirect(`${base}${path}`, { status: 303 });
}

// Public, unauthenticated by design (no login exists to unsubscribe from
// email) — authorization comes entirely from the HMAC-signed token, not
// from a session. Uses the service-role client since there is no admin
// session here, same reasoning as the webhook/cron routes. POST-only,
// reached only via the confirmation form on the /unsubscribe landing page
// (not a bare GET link) so mail-client link prefetching can't trigger an
// accidental unsubscribe.
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = String(formData.get("token") || "");

  const contactId = token ? verifyUnsubscribeToken(token) : null;
  if (!contactId) {
    return redirectTo(request, "/unsubscribe?error=invalid");
  }

  const supabase = createServiceRoleClient();
  const { data: contact } = await supabase.from("email_contacts").select("id, email").eq("id", contactId).maybeSingle();
  if (!contact) {
    return redirectTo(request, "/unsubscribe?error=invalid");
  }

  const emailNormalized = normalizeEmail(contact.email);
  const now = new Date().toISOString();

  await supabase.from("email_contacts").update({ status: "unsubscribed", is_subscribed: false, unsubscribed_at: now }).eq("id", contact.id);

  await supabase
    .from("email_suppression_list")
    .upsert(
      { email_normalized: emailNormalized, original_email: contact.email, reason: "unsubscribed", source: "unsubscribe_link", is_active: true, restored_at: null, restored_by: null },
      { onConflict: "email_normalized" }
    );

  await logActivity(supabase, {
    actorType: "system",
    action: "contact.unsubscribed",
    entityType: "email_contact",
    entityId: contact.id,
  });

  return redirectTo(request, "/unsubscribe?done=1");
}
