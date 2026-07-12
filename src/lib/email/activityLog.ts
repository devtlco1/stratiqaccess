import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityActorType } from "./dbTypes";

// Truncate anything that risks being a full message body before it reaches
// the audit log — logs are for "who did what, when," not message content.
function truncate(value: string | null | undefined, max = 160): string | null {
  if (!value) return null;
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

export async function logActivity(
  supabase: SupabaseClient,
  entry: {
    actorType: ActivityActorType;
    actorId?: string | null;
    actorLabel?: string | null;
    action: string;
    entityType: string;
    entityId?: string | null;
    metadata?: Record<string, unknown>;
  }
): Promise<void> {
  const safeMetadata = { ...entry.metadata };
  if (typeof safeMetadata.subject === "string") {
    safeMetadata.subject = truncate(safeMetadata.subject);
  }

  const { error } = await supabase.from("email_activity_logs").insert({
    actor_type: entry.actorType,
    actor_id: entry.actorId ?? null,
    actor_label: entry.actorLabel ?? null,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    metadata: safeMetadata,
  });

  if (error) {
    // Audit logging must never break the primary action it's describing.
    console.error("[email-center] failed to write activity log:", error.message);
  }
}
