import type { SupabaseClient } from "@supabase/supabase-js";
import { isValidEmail, normalizeEmail } from "./contactImport";
import type { EmailContactRow } from "./dbTypes";

export interface RecipientSelection {
  contactIds: string[];
  listIds: string[];
  filters: { status?: string; country?: string; sector?: string; tag?: string };
  manualEmails: string[];
}

export interface SyncSummary {
  totalSelected: number;
  duplicatesRemoved: number;
  invalidContacts: number;
  suppressedContacts: number;
  contactsWithoutName: number;
  finalSendCount: number;
}

// Resolves a RecipientSelection into a deduplicated set of email_contacts
// rows, creating new contacts for manually-entered addresses that don't
// already exist (source: 'manual', same as adding one contact by hand).
async function resolveContacts(supabase: SupabaseClient, selection: RecipientSelection): Promise<{ contacts: EmailContactRow[]; invalidManualEmails: string[] }> {
  const idSet = new Set<string>(selection.contactIds);

  if (selection.listIds.length > 0) {
    const { data } = await supabase.from("email_contact_list_members").select("contact_id").in("list_id", selection.listIds);
    for (const row of data ?? []) idSet.add(row.contact_id);
  }

  if (selection.filters.status || selection.filters.country || selection.filters.sector || selection.filters.tag) {
    let query = supabase.from("email_contacts").select("id");
    if (selection.filters.status) query = query.eq("status", selection.filters.status);
    if (selection.filters.country) query = query.ilike("country", `%${selection.filters.country}%`);
    if (selection.filters.sector) query = query.ilike("sector", `%${selection.filters.sector}%`);
    if (selection.filters.tag) query = query.contains("tags", [selection.filters.tag]);
    const { data } = await query;
    for (const row of data ?? []) idSet.add(row.id);
  }

  const invalidManualEmails: string[] = [];
  for (const rawEmail of selection.manualEmails) {
    const email = rawEmail.trim();
    if (!email) continue;
    if (!isValidEmail(email)) {
      invalidManualEmails.push(email);
      continue;
    }
    const normalized = normalizeEmail(email);
    const { data: existing } = await supabase.from("email_contacts").select("id").eq("email_normalized", normalized).maybeSingle();
    if (existing) {
      idSet.add(existing.id);
    } else {
      const { data: created, error } = await supabase
        .from("email_contacts")
        .insert({ name: email.split("@")[0], email, source: "manual" })
        .select("id")
        .single();
      if (!error && created) idSet.add(created.id);
    }
  }

  if (idSet.size === 0) return { contacts: [], invalidManualEmails };

  const ids = Array.from(idSet);
  const CHUNK = 500;
  const contacts: EmailContactRow[] = [];
  for (let i = 0; i < ids.length; i += CHUNK) {
    const { data } = await supabase.from("email_contacts").select("*").in("id", ids.slice(i, i + CHUNK));
    contacts.push(...((data ?? []) as EmailContactRow[]));
  }
  return { contacts, invalidManualEmails };
}

// Materializes the resolved contact set into email_campaign_recipients rows.
// Idempotent: re-running (e.g. the admin adjusts recipient selection and
// re-syncs) uses ON CONFLICT DO NOTHING on the (campaign_id, contact_id)
// unique constraint, so already-queued/sent recipients are never reset or
// duplicated.
export async function syncCampaignRecipients(
  supabase: SupabaseClient,
  campaignId: string,
  selection: RecipientSelection
): Promise<SyncSummary> {
  const { contacts, invalidManualEmails } = await resolveContacts(supabase, selection);
  const totalSelected = contacts.length + invalidManualEmails.length;
  const duplicatesRemoved = 0; // resolveContacts already dedupes via idSet before this point

  const emails = contacts.map((c) => normalizeEmail(c.email));
  const suppressedSet = new Set<string>();
  if (emails.length > 0) {
    const CHUNK = 500;
    for (let i = 0; i < emails.length; i += CHUNK) {
      const { data } = await supabase
        .from("email_suppression_list")
        .select("email_normalized")
        .eq("is_active", true)
        .in("email_normalized", emails.slice(i, i + CHUNK));
      for (const row of data ?? []) suppressedSet.add(row.email_normalized);
    }
  }

  let suppressedContacts = 0;
  let contactsWithoutName = 0;

  const rows = contacts.map((contact) => {
    const isSuppressed = suppressedSet.has(normalizeEmail(contact.email)) || contact.status === "suppressed" || contact.status === "unsubscribed" || contact.status === "bounced";
    if (isSuppressed) suppressedContacts++;
    if (!contact.name || contact.name.trim() === contact.email.split("@")[0]) contactsWithoutName++;

    return {
      campaign_id: campaignId,
      contact_id: contact.id,
      email_snapshot: contact.email,
      name_snapshot: contact.name,
      status: isSuppressed ? ("suppressed" as const) : ("pending" as const),
    };
  });

  if (rows.length > 0) {
    const CHUNK = 500;
    for (let i = 0; i < rows.length; i += CHUNK) {
      await supabase.from("email_campaign_recipients").upsert(rows.slice(i, i + CHUNK), { onConflict: "campaign_id,contact_id", ignoreDuplicates: true });
    }
  }

  const { count: finalSendCount } = await supabase
    .from("email_campaign_recipients")
    .select("id", { count: "exact", head: true })
    .eq("campaign_id", campaignId)
    .eq("status", "pending");

  await supabase.from("email_campaigns").update({ total_recipients: rows.length, recipient_selection: selection }).eq("id", campaignId);

  return {
    totalSelected,
    duplicatesRemoved,
    invalidContacts: invalidManualEmails.length,
    suppressedContacts,
    contactsWithoutName,
    finalSendCount: finalSendCount ?? 0,
  };
}
