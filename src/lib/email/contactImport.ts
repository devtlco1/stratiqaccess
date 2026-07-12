// Pure, DB-free import logic: parsing rows into a preview of what an import
// would do (add / update / skip duplicate / reject invalid) is deliberately
// separated from the Server Actions that call it, so it can be unit tested
// without a database and reused by both the CSV/XLSX/paste importer and the
// "Import from Customers/Messages" bridge.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export interface ImportFieldMapping {
  name?: string;
  company_name?: string;
  email: string;
  phone?: string;
  country?: string;
  city?: string;
  sector?: string;
  job_title?: string;
  website?: string;
  language?: string;
  notes?: string;
  tags?: string;
}

export interface ParsedContact {
  name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  country: string | null;
  city: string | null;
  sector: string | null;
  job_title: string | null;
  website: string | null;
  language: string | null;
  notes: string | null;
  tags: string[];
}

export type ImportOutcome = "add" | "update" | "skip_duplicate_in_file" | "reject_invalid_email" | "reject_missing_email";

export interface ImportRowResult {
  index: number;
  parsed: ParsedContact | null;
  outcome: ImportOutcome;
  reason?: string;
  existingContactId?: string;
}

function cell(row: Record<string, string>, column: string | undefined): string | null {
  if (!column) return null;
  const value = row[column];
  return value?.trim() ? value.trim() : null;
}

export function parseRow(row: Record<string, string>, mapping: ImportFieldMapping): ParsedContact | null {
  const email = cell(row, mapping.email);
  if (!email) return null;

  const tagsRaw = cell(row, mapping.tags);
  return {
    name: cell(row, mapping.name) ?? email.split("@")[0],
    company_name: cell(row, mapping.company_name),
    email,
    phone: cell(row, mapping.phone),
    country: cell(row, mapping.country),
    city: cell(row, mapping.city),
    sector: cell(row, mapping.sector),
    job_title: cell(row, mapping.job_title),
    website: cell(row, mapping.website),
    language: cell(row, mapping.language),
    notes: cell(row, mapping.notes),
    tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
  };
}

export function categorizeImportRows(
  rows: Record<string, string>[],
  mapping: ImportFieldMapping,
  existingEmails: Map<string, string>
): ImportRowResult[] {
  const seenInFile = new Set<string>();
  const results: ImportRowResult[] = [];

  rows.forEach((row, index) => {
    const rawEmail = cell(row, mapping.email);
    if (!rawEmail) {
      results.push({ index, parsed: null, outcome: "reject_missing_email", reason: "No email address found for this row." });
      return;
    }
    if (!isValidEmail(rawEmail)) {
      results.push({ index, parsed: null, outcome: "reject_invalid_email", reason: `"${rawEmail}" is not a valid email address.` });
      return;
    }

    const normalized = normalizeEmail(rawEmail);
    const parsed = parseRow(row, mapping);

    if (seenInFile.has(normalized)) {
      results.push({ index, parsed, outcome: "skip_duplicate_in_file", reason: "Duplicate email within this import file." });
      return;
    }
    seenInFile.add(normalized);

    const existingId = existingEmails.get(normalized);
    if (existingId) {
      results.push({ index, parsed, outcome: "update", existingContactId: existingId });
    } else {
      results.push({ index, parsed, outcome: "add" });
    }
  });

  return results;
}

export function summarizeImportResults(results: ImportRowResult[]) {
  return {
    total: results.length,
    toAdd: results.filter((r) => r.outcome === "add").length,
    toUpdate: results.filter((r) => r.outcome === "update").length,
    duplicatesInFile: results.filter((r) => r.outcome === "skip_duplicate_in_file").length,
    invalidEmails: results.filter((r) => r.outcome === "reject_invalid_email").length,
    missingEmails: results.filter((r) => r.outcome === "reject_missing_email").length,
  };
}
