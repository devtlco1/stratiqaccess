import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeEmail } from "./contactImport";

const THREAD_FRESHNESS_DAYS = 45;

// Strips repeated Re:/Fwd:/Fw: prefixes (any case, any order), collapses
// whitespace, lowercases. Used to group messages into the same internal
// thread — see docs/EMAIL_CENTER.md for why this is a heuristic grouping,
// not real RFC5322 threading (Hostinger's send API has no header support).
export function normalizeSubject(subject: string | null | undefined): string {
  if (!subject) return "(no subject)";
  let s = subject.trim();
  let stripped = true;
  while (stripped) {
    const next = s.replace(/^(re|fwd?|fw)\s*:\s*/i, "");
    stripped = next !== s;
    s = next;
  }
  return s.toLowerCase().replace(/\s+/g, " ").trim() || "(no subject)";
}

export interface ThreadMatchInput {
  contactId: string | null;
  contactEmail: string;
  subject: string | null;
  messageDate: Date;
  campaignId?: string | null;
}

// Find-or-create is not wrapped in a DB-level advisory lock (unlike the
// queue's atomic claim function) — a rare race here produces at most a
// cosmetic duplicate thread grouping, not a duplicate send or data loss, so
// the added complexity of another stored procedure isn't proportionate.
export async function findOrCreateThread(
  supabase: SupabaseClient,
  input: ThreadMatchInput
): Promise<{ id: string; isNew: boolean }> {
  const subjectNormalized = normalizeSubject(input.subject);
  const contactEmail = normalizeEmail(input.contactEmail);
  const freshnessCutoff = new Date(input.messageDate.getTime() - THREAD_FRESHNESS_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data: existing } = await supabase
    .from("email_threads")
    .select("id")
    .eq("contact_email", contactEmail)
    .eq("subject_normalized", subjectNormalized)
    .gte("last_message_at", freshnessCutoff)
    .order("last_message_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return { id: existing.id, isNew: false };

  const { data: created, error } = await supabase
    .from("email_threads")
    .insert({
      contact_id: input.contactId,
      contact_email: contactEmail,
      subject_normalized: subjectNormalized,
      campaign_id: input.campaignId ?? null,
      last_message_at: input.messageDate.toISOString(),
    })
    .select("id")
    .single();

  if (error || !created) throw new Error(`Failed to create email thread: ${error?.message}`);
  return { id: created.id, isNew: true };
}

export async function touchThread(
  supabase: SupabaseClient,
  threadId: string,
  updates: { lastMessageAt: Date; preview: string | null; markUnread?: boolean }
): Promise<void> {
  await supabase
    .from("email_threads")
    .update({
      last_message_at: updates.lastMessageAt.toISOString(),
      last_message_preview: updates.preview?.slice(0, 200) ?? null,
      ...(updates.markUnread !== undefined ? { is_unread: updates.markUnread } : {}),
    })
    .eq("id", threadId);
}
