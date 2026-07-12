import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { verifyBearerToken } from "@/lib/email/bearerAuth";
import { logActivity } from "@/lib/email/activityLog";
import { processQueueBatch } from "@/lib/email/queueProcessor";

// Hit by a Hostinger Cron Job (see docs/EMAIL_CENTER.md for exact setup) on
// a fixed interval — every invocation processes at most one batch per
// active campaign (see queueProcessor.ts / claim_campaign_recipients) and
// returns immediately after, rather than looping internally. Overlapping
// invocations cannot double-send: the atomic FOR UPDATE SKIP LOCKED claim
// means a second invocation that starts before the first finishes simply
// claims a disjoint set of recipients.
export async function POST(request: NextRequest) {
  const authorized = verifyBearerToken(request.headers.get("authorization"), process.env.EMAIL_CRON_SECRET);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceRoleClient();
  const runId = randomUUID();

  try {
    const result = await processQueueBatch(supabase, runId);

    await logActivity(supabase, {
      actorType: "cron",
      actorLabel: runId,
      action: "queue.batch_processed",
      entityType: "email_queue",
      metadata: {
        campaignsProcessed: result.campaignsProcessed,
        recipientsClaimed: result.recipientsClaimed,
        sent: result.sent,
        failed: result.failed,
        suppressed: result.suppressed,
        circuitBroken: result.circuitBroken,
      },
    });

    return NextResponse.json({ ok: true, runId, ...result });
  } catch (error) {
    console.error("[email-queue-cron] batch processing failed:", error instanceof Error ? error.message : error);
    return NextResponse.json({ ok: false, error: "Queue processing failed — see server logs." }, { status: 500 });
  }
}

// Lightweight reachability probe for the Settings health panel — never
// processes anything, never requires the cron secret (no sensitive data
// returned), just confirms the route is deployed and responding.
export async function GET() {
  return NextResponse.json({ ok: true, route: "email-queue-cron" });
}
