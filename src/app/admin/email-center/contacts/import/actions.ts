"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/email/activityLog";
import { parseCsvText, parsePastedText, parseXlsxBuffer, type ParsedFile } from "@/lib/email/parseImportFile";
import { categorizeImportRows, normalizeEmail, summarizeImportResults, type ImportFieldMapping, type ImportRowResult } from "@/lib/email/contactImport";
import type { ContactSource } from "@/lib/email/dbTypes";

export async function parseImportSource(formData: FormData): Promise<ParsedFile> {
  const file = formData.get("file");
  const pastedText = String(formData.get("pastedText") || "");

  if (file instanceof File && file.size > 0) {
    if (file.name.toLowerCase().endsWith(".xlsx")) {
      const buffer = await file.arrayBuffer();
      return parseXlsxBuffer(buffer);
    }
    const text = await file.text();
    return parseCsvText(text);
  }

  if (pastedText.trim()) {
    return parsePastedText(pastedText);
  }

  return { headers: [], rows: [], truncated: false };
}

async function fetchExistingEmails(supabase: Awaited<ReturnType<typeof createClient>>, emails: string[]): Promise<Map<string, string>> {
  const normalized = Array.from(new Set(emails.map(normalizeEmail))).filter(Boolean);
  const map = new Map<string, string>();
  if (normalized.length === 0) return map;

  // Chunk to stay well under typical query/URL size limits for large imports.
  const CHUNK = 500;
  for (let i = 0; i < normalized.length; i += CHUNK) {
    const chunk = normalized.slice(i, i + CHUNK);
    const { data } = await supabase.from("email_contacts").select("id, email_normalized").in("email_normalized", chunk);
    for (const row of data ?? []) map.set(row.email_normalized, row.id);
  }
  return map;
}

export async function previewImport(
  rows: Record<string, string>[],
  mapping: ImportFieldMapping
): Promise<{ results: ImportRowResult[]; summary: ReturnType<typeof summarizeImportResults> }> {
  const supabase = await createClient();
  const candidateEmails = rows.map((r) => (mapping.email ? r[mapping.email] : "")).filter(Boolean);
  const existingEmails = await fetchExistingEmails(supabase, candidateEmails);

  const results = categorizeImportRows(rows, mapping, existingEmails);
  return { results, summary: summarizeImportResults(results) };
}

export async function commitImport(
  rows: Record<string, string>[],
  mapping: ImportFieldMapping,
  source: ContactSource
): Promise<{ inserted: number; updated: number; skipped: number; rejected: number }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const candidateEmails = rows.map((r) => (mapping.email ? r[mapping.email] : "")).filter(Boolean);
  const existingEmails = await fetchExistingEmails(supabase, candidateEmails);
  const results = categorizeImportRows(rows, mapping, existingEmails);

  let inserted = 0;
  let updated = 0;

  for (const result of results) {
    if (!result.parsed) continue;
    if (result.outcome === "add") {
      const { error } = await supabase.from("email_contacts").insert({ ...result.parsed, source });
      if (!error) inserted++;
    } else if (result.outcome === "update" && result.existingContactId) {
      const { error } = await supabase
        .from("email_contacts")
        .update({
          name: result.parsed.name,
          company_name: result.parsed.company_name,
          phone: result.parsed.phone,
          country: result.parsed.country,
          city: result.parsed.city,
          sector: result.parsed.sector,
          job_title: result.parsed.job_title,
          website: result.parsed.website,
          language: result.parsed.language,
          tags: result.parsed.tags,
        })
        .eq("id", result.existingContactId);
      if (!error) updated++;
    }
  }

  const skipped = results.filter((r) => r.outcome === "skip_duplicate_in_file").length;
  const rejected = results.filter((r) => r.outcome === "reject_invalid_email" || r.outcome === "reject_missing_email").length;

  await logActivity(supabase, {
    actorType: "user",
    actorId: user?.id,
    action: "contact.import_committed",
    entityType: "email_contact",
    metadata: { source, inserted, updated, skipped, rejected, totalRows: rows.length },
  });

  revalidatePath("/admin/email-center/contacts");
  return { inserted, updated, skipped, rejected };
}

const CUSTOMER_MAPPING: ImportFieldMapping = { name: "name", company_name: "company", email: "email", phone: "phone" };
const MESSAGE_MAPPING: ImportFieldMapping = {
  name: "name",
  company_name: "company_name",
  email: "email",
  phone: "phone",
  country: "country",
  job_title: "job_title",
};

export async function loadCustomersAsRows(): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  const supabase = await createClient();
  const { data } = await supabase.from("customers").select("name, company, email, phone").not("email", "is", null);
  const rows = (data ?? []).map((r) => ({
    name: r.name ?? "",
    company: r.company ?? "",
    email: r.email ?? "",
    phone: r.phone ?? "",
  }));
  return { headers: Object.keys(CUSTOMER_MAPPING).map((k) => CUSTOMER_MAPPING[k as keyof ImportFieldMapping] as string), rows };
}

export async function loadMessagesAsRows(): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("first_name, last_name, company_name, email, phone, country, job_title")
    .not("email", "is", null);
  const rows = (data ?? []).map((r) => ({
    name: [r.first_name, r.last_name].filter(Boolean).join(" "),
    company_name: r.company_name ?? "",
    email: r.email ?? "",
    phone: r.phone ?? "",
    country: r.country ?? "",
    job_title: r.job_title ?? "",
  }));
  return { headers: ["name", "company_name", "email", "phone", "country", "job_title"], rows };
}

export const BRIDGE_MAPPINGS = { customers: CUSTOMER_MAPPING, messages: MESSAGE_MAPPING };
