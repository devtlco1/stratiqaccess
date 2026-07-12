"use client";

import { useState } from "react";
import Link from "next/link";
import type { ImportFieldMapping, ImportRowResult } from "@/lib/email/contactImport";
import { summarizeImportResults } from "@/lib/email/contactImport";
import type { ContactSource } from "@/lib/email/dbTypes";
import {
  parseImportSource,
  previewImport,
  commitImport,
  loadCustomersAsRows,
  loadMessagesAsRows,
  BRIDGE_MAPPINGS,
} from "./actions";

type Step = "source" | "map" | "preview" | "done";

const TARGET_FIELDS: { key: keyof ImportFieldMapping; label: string; required?: boolean }[] = [
  { key: "email", label: "Email", required: true },
  { key: "name", label: "Name" },
  { key: "company_name", label: "Company" },
  { key: "phone", label: "Phone" },
  { key: "country", label: "Country" },
  { key: "city", label: "City" },
  { key: "sector", label: "Sector" },
  { key: "job_title", label: "Job Title" },
  { key: "website", label: "Website" },
  { key: "language", label: "Language" },
  { key: "tags", label: "Tags (comma separated)" },
];

export function ImportWizard() {
  const [step, setStep] = useState<Step>("source");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [truncated, setTruncated] = useState(false);
  const [source, setSource] = useState<ContactSource>("csv_import");
  const [mapping, setMapping] = useState<ImportFieldMapping>({ email: "" });

  const [results, setResults] = useState<ImportRowResult[]>([]);
  const [committed, setCommitted] = useState<{ inserted: number; updated: number; skipped: number; rejected: number } | null>(null);

  async function handleFileOrPaste(formData: FormData, chosenSource: ContactSource) {
    setLoading(true);
    setError(null);
    try {
      const parsed = await parseImportSource(formData);
      if (parsed.rows.length === 0) {
        setError("No rows found in that file/text — check the format and try again.");
        return;
      }
      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setTruncated(parsed.truncated);
      setSource(chosenSource);
      // Best-effort auto-map common header names.
      const auto: Partial<Record<keyof ImportFieldMapping, string>> = {};
      for (const field of TARGET_FIELDS) {
        const match = parsed.headers.find((h) => h.toLowerCase().replace(/[\s_-]/g, "") === field.key.replace(/_/g, ""));
        if (match) auto[field.key] = match;
      }
      setMapping({ email: "", ...auto });
      setStep("map");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to parse the file.");
    } finally {
      setLoading(false);
    }
  }

  async function handleBridge(bridgeSource: "customers" | "messages") {
    setLoading(true);
    setError(null);
    try {
      const { headers: h, rows: r } = bridgeSource === "customers" ? await loadCustomersAsRows() : await loadMessagesAsRows();
      if (r.length === 0) {
        setError(`No ${bridgeSource} with an email address were found.`);
        return;
      }
      setHeaders(h);
      setRows(r);
      setTruncated(false);
      setSource(bridgeSource === "customers" ? "import_customers" : "import_messages");
      setMapping(BRIDGE_MAPPINGS[bridgeSource]);
      setStep("map");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load records.");
    } finally {
      setLoading(false);
    }
  }

  async function runPreview() {
    if (!mapping.email) {
      setError("You must map a column to Email before previewing.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { results: r } = await previewImport(rows, mapping);
      setResults(r);
      setStep("preview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to preview the import.");
    } finally {
      setLoading(false);
    }
  }

  async function runCommit() {
    setLoading(true);
    setError(null);
    try {
      const result = await commitImport(rows, mapping, source);
      setCommitted(result);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to commit the import.");
    } finally {
      setLoading(false);
    }
  }

  const summary = results.length > 0 ? summarizeImportResults(results) : null;

  return (
    <div className="mt-8 max-w-3xl">
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {step === "source" && (
        <div className="flex flex-col gap-6">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg text-navy">Upload CSV or XLSX</h2>
            <form
              className="mt-4 flex items-center gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const file = formData.get("file") as File;
                const chosenSource: ContactSource = file?.name?.toLowerCase().endsWith(".xlsx") ? "xlsx_import" : "csv_import";
                handleFileOrPaste(formData, chosenSource);
              }}
            >
              <input type="file" name="file" accept=".csv,.xlsx" required className="text-sm" />
              <button type="submit" disabled={loading} className="rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors disabled:opacity-60">
                {loading ? "Parsing…" : "Continue"}
              </button>
            </form>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg text-navy">Paste a List</h2>
            <p className="mt-1 text-sm text-ink/60">Paste comma-separated rows with a header row, e.g. <code>name,email</code> then one row per contact.</p>
            <form
              className="mt-4 flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleFileOrPaste(formData, "paste_import");
              }}
            >
              <textarea
                name="pastedText"
                rows={6}
                required
                placeholder={"name,email,company\nJohn Smith,john@example.com,Acme Inc."}
                className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm font-mono focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
              />
              <button type="submit" disabled={loading} className="self-start rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors disabled:opacity-60">
                {loading ? "Parsing…" : "Continue"}
              </button>
            </form>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg text-navy">Import from Existing Data</h2>
            <p className="mt-1 text-sm text-ink/60">Pull in leads already captured via the Customers CRM or website contact-form Messages.</p>
            <div className="mt-4 flex gap-3">
              <button onClick={() => handleBridge("customers")} disabled={loading} className="rounded-md border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper transition-colors disabled:opacity-60">
                From Customers
              </button>
              <button onClick={() => handleBridge("messages")} disabled={loading} className="rounded-md border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper transition-colors disabled:opacity-60">
                From Messages
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "map" && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg text-navy">Map Columns</h2>
          <p className="mt-1 text-sm text-ink/60">
            {rows.length} row{rows.length === 1 ? "" : "s"} found{truncated ? " (truncated to the first 5,000)" : ""}. Map each field to a column from your file.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {TARGET_FIELDS.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-ink/80 mb-1.5">
                  {field.label} {field.required && <span className="text-red-600">*</span>}
                </label>
                <select
                  value={(mapping[field.key] as string) ?? ""}
                  onChange={(e) => setMapping((m) => ({ ...m, [field.key]: e.target.value || undefined }))}
                  className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
                >
                  <option value="">— Not mapped —</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setStep("source")} className="rounded-md border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper transition-colors">
              Back
            </button>
            <button onClick={runPreview} disabled={loading} className="rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors disabled:opacity-60">
              {loading ? "Checking…" : "Preview Import"}
            </button>
          </div>
        </div>
      )}

      {step === "preview" && summary && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg text-navy">Preview</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <Stat label="New Contacts" value={summary.toAdd} />
            <Stat label="Will Update" value={summary.toUpdate} />
            <Stat label="Duplicates in File" value={summary.duplicatesInFile} />
            <Stat label="Invalid Emails" value={summary.invalidEmails} />
            <Stat label="Missing Emails" value={summary.missingEmails} />
          </div>

          <div className="mt-6 max-h-96 overflow-y-auto rounded-lg border border-navy/10">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-paper text-left text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Outcome</th>
                  <th className="px-3 py-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 200).map((r) => (
                  <tr key={r.index} className="border-t border-navy/5">
                    <td className="px-3 py-1.5 text-ink/50">{r.index + 1}</td>
                    <td className="px-3 py-1.5">{r.parsed?.email ?? "—"}</td>
                    <td className="px-3 py-1.5">
                      <OutcomeBadge outcome={r.outcome} />
                    </td>
                    <td className="px-3 py-1.5 text-ink/60">{r.reason ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {results.length > 200 && (
              <p className="p-3 text-xs text-ink/50">Showing the first 200 of {results.length} rows.</p>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button onClick={() => setStep("map")} className="rounded-md border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper transition-colors">
              Back
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Import ${summary.toAdd} new contact(s) and update ${summary.toUpdate} existing contact(s)?`)) {
                  runCommit();
                }
              }}
              disabled={loading || (summary.toAdd === 0 && summary.toUpdate === 0)}
              className="rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors disabled:opacity-60"
            >
              {loading ? "Importing…" : `Confirm Import (${summary.toAdd + summary.toUpdate})`}
            </button>
          </div>
        </div>
      )}

      {step === "done" && committed && (
        <div className="rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg text-navy">Import Complete</h2>
          <p className="mt-2 text-sm text-ink/70">
            {committed.inserted} added · {committed.updated} updated · {committed.skipped} duplicates skipped · {committed.rejected} rejected.
          </p>
          <Link href="/admin/email-center/contacts" className="mt-6 inline-block rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors">
            View Contacts
          </Link>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-paper p-3">
      <p className="font-display text-xl text-navy">{value}</p>
      <p className="text-xs text-ink/60">{label}</p>
    </div>
  );
}

function OutcomeBadge({ outcome }: { outcome: ImportRowResult["outcome"] }) {
  const styles: Record<ImportRowResult["outcome"], string> = {
    add: "bg-green-100 text-green-700",
    update: "bg-blue-100 text-blue-700",
    skip_duplicate_in_file: "bg-amber-100 text-amber-700",
    reject_invalid_email: "bg-red-100 text-red-700",
    reject_missing_email: "bg-red-100 text-red-700",
  };
  const labels: Record<ImportRowResult["outcome"], string> = {
    add: "Add",
    update: "Update",
    skip_duplicate_in_file: "Duplicate",
    reject_invalid_email: "Invalid",
    reject_missing_email: "Missing Email",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${styles[outcome]}`}>{labels[outcome]}</span>;
}
