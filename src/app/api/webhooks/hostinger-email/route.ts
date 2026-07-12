import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { verifyBearerToken } from "@/lib/email/bearerAuth";
import { logActivity } from "@/lib/email/activityLog";
import { getMailboxResourceId } from "@/lib/hostinger/mailbox";
import { getMessage, listMessages } from "@/lib/hostinger/messages";
import { syncInboundMessage } from "@/lib/email/inboxSync";

// Best-effort extraction only — the actual JSON shape Hostinger POSTs here
// is NOT documented in their OpenAPI spec (only that it's a POST with
// Authorization: Bearer <webhook secret> for the "message.received" event).
// Nothing extracted here is trusted for message CONTENT — it's only used to
// (a) attempt event-level dedup and (b) possibly skip straight to a single
// GET .../messages/{uid} instead of listing recent INBOX messages. If every
// field below is absent, processing still works correctly by falling back
// to "check recent INBOX messages for anything not already synced."
function extractDedupKey(parsed: unknown): string | null {
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  const candidates = [obj.id, obj.eventId, obj.event_id, (obj.data as Record<string, unknown> | undefined)?.id];
  const found = candidates.find((c) => typeof c === "string" && c.length > 0);
  return (found as string) ?? null;
}

function extractCandidateUid(parsed: unknown): number | null {
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  const direct = obj.uid ?? (obj.data as Record<string, unknown> | undefined)?.uid;
  const num = typeof direct === "number" ? direct : typeof direct === "string" ? Number(direct) : NaN;
  return Number.isFinite(num) ? num : null;
}

function extractFolder(parsed: unknown): string {
  if (!parsed || typeof parsed !== "object") return "INBOX";
  const obj = parsed as Record<string, unknown>;
  const direct = obj.folder ?? (obj.data as Record<string, unknown> | undefined)?.folder;
  return typeof direct === "string" && direct ? direct : "INBOX";
}

export async function POST(request: NextRequest) {
  const authorized = verifyBearerToken(request.headers.get("authorization"), process.env.HOSTINGER_WEBHOOK_SECRET);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.text();
  let parsedBody: unknown = null;
  try {
    parsedBody = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    // Tolerated — raw_body is still stored below regardless of parse success.
  }

  const supabase = createServiceRoleClient();
  const dedupKey = extractDedupKey(parsedBody);

  if (dedupKey) {
    const { data: existing } = await supabase.from("email_webhook_events").select("id").eq("dedup_key", dedupKey).maybeSingle();
    if (existing) {
      // Already processed (or in flight) — acknowledge without reprocessing.
      return NextResponse.json({ ok: true, deduplicated: true });
    }
  }

  const headersRecord: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== "authorization") headersRecord[key] = value; // never store the bearer secret itself
  });

  const { data: eventRow, error: insertError } = await supabase
    .from("email_webhook_events")
    .insert({
      event_type: "message.received",
      dedup_key: dedupKey,
      raw_body: rawBody,
      parsed_body: parsedBody,
      headers: headersRecord,
      processing_status: "received",
    })
    .select("id")
    .single();

  if (insertError || !eventRow) {
    console.error("[hostinger-webhook] failed to store event:", insertError?.message);
    // Still return 200 — a storage failure shouldn't cause Hostinger to
    // retry-storm us; the failure is visible in server logs / Settings health.
    return NextResponse.json({ ok: false, stored: false });
  }

  // Respond fast, then resolve the actual message. This is a persistent
  // Node process (not serverless), so continuing work after constructing
  // the response object — without awaiting further work before returning —
  // isn't reliable the way a background queue would be; instead we do the
  // resolution inline but keep it bounded (max ~20 messages) so the response
  // is still fast in practice, and any failure is captured on the event row
  // for the Settings health panel rather than left silent.
  try {
    await supabase.from("email_webhook_events").update({ processing_status: "processing" }).eq("id", eventRow.id);

    const mailboxResourceId = await getMailboxResourceId(supabase);
    const folder = extractFolder(parsedBody);
    const candidateUid = extractCandidateUid(parsedBody);

    let resolvedMessageRowId: string | null = null;

    if (candidateUid) {
      const message = await getMessage(mailboxResourceId, folder, candidateUid);
      const synced = await syncInboundMessage(supabase, mailboxResourceId, message, true);
      resolvedMessageRowId = synced.messageRowId;
    } else {
      const { messages } = await listMessages(mailboxResourceId, folder, { perPage: 20, sort: "-uid" });
      for (const message of messages) {
        const synced = await syncInboundMessage(supabase, mailboxResourceId, message, true);
        if (synced.isNewMessage) resolvedMessageRowId = synced.messageRowId;
      }
    }

    await supabase
      .from("email_webhook_events")
      .update({ processing_status: "processed", processed_at: new Date().toISOString(), resolved_message_id: resolvedMessageRowId })
      .eq("id", eventRow.id);

    await logActivity(supabase, {
      actorType: "webhook",
      action: "message.received",
      entityType: "email_webhook_event",
      entityId: eventRow.id,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[hostinger-webhook] processing failed:", message);
    await supabase.from("email_webhook_events").update({ processing_status: "failed", error: message, processed_at: new Date().toISOString() }).eq("id", eventRow.id);
    // Still 200: the event is safely stored, and Hostinger retrying the
    // same delivery wouldn't fix an application-side processing error.
    return NextResponse.json({ ok: true, processed: false });
  }
}

// Health probe for the Settings page — confirms the endpoint is deployed
// and reachable without requiring the webhook secret (returns no sensitive data).
export async function GET() {
  return NextResponse.json({ ok: true, route: "hostinger-email-webhook" });
}
