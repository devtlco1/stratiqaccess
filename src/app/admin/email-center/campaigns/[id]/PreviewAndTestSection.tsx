"use client";

import { useState } from "react";
import type { EmailCampaignRecipientRow } from "@/lib/email/dbTypes";
import { previewCampaignForContacts, sendCampaignTestEmail, type CampaignPreviewResult } from "../actions";

export function PreviewAndTestSection({
  campaignId,
  recipients,
}: {
  campaignId: string;
  recipients: (EmailCampaignRecipientRow & { contact_id: string })[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(recipients.slice(0, 5).map((r) => r.contact_id));
  const [previews, setPreviews] = useState<CampaignPreviewResult[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [testEmail, setTestEmail] = useState("");
  const [testContactId, setTestContactId] = useState("");
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);

  function toggleSelected(contactId: string) {
    setSelectedIds((prev) => {
      if (prev.includes(contactId)) return prev.filter((id) => id !== contactId);
      if (prev.length >= 5) return prev;
      return [...prev, contactId];
    });
  }

  async function runPreview() {
    setPreviewLoading(true);
    try {
      const result = await previewCampaignForContacts(campaignId, selectedIds);
      setPreviews(result);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function runTestSend() {
    setTestLoading(true);
    setTestResult(null);
    try {
      const result = await sendCampaignTestEmail(campaignId, testEmail, testContactId || null);
      setTestResult(result);
    } finally {
      setTestLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-medium text-ink/80 mb-2">Select up to 5 recipients to preview (personalized per contact)</p>
        <div className="flex flex-wrap gap-2">
          {recipients.slice(0, 50).map((r) => (
            <label key={r.id} className="flex items-center gap-1.5 rounded-md bg-paper px-2.5 py-1.5 text-xs text-ink/80">
              <input
                type="checkbox"
                checked={selectedIds.includes(r.contact_id)}
                onChange={() => toggleSelected(r.contact_id)}
                className="size-3.5 rounded border-navy/30"
              />
              {r.name_snapshot || r.email_snapshot}
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={runPreview}
          disabled={previewLoading || selectedIds.length === 0}
          className="mt-3 rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors disabled:opacity-60"
        >
          {previewLoading ? "Rendering…" : `Preview ${selectedIds.length} Recipient(s)`}
        </button>

        {previews.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {previews.map((p) => (
              <div key={p.contactEmail} className="rounded-lg border border-navy/10 p-3">
                <p className="text-xs text-ink/50">
                  To: {p.contactName} &lt;{p.contactEmail}&gt;
                </p>
                <p className="mt-1 text-sm font-medium text-navy">{p.subject}</p>
                {p.missingVariables.length > 0 && (
                  <p className="mt-1 rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">Unresolved: {p.missingVariables.join(", ")}</p>
                )}
                <div className="mt-2 max-h-40 overflow-auto rounded bg-paper p-2 text-xs" dangerouslySetInnerHTML={{ __html: p.html }} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <h3 className="font-display text-base text-navy">Send Test Email</h3>
        <p className="mt-1 text-xs text-ink/60">Goes only to the address entered here — required before this campaign can be queued.</p>
        <div className="mt-3 flex flex-col gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="you@stratiqaccess.com"
            className="rounded-lg border border-navy/15 px-3 py-2 text-sm"
          />
          <select value={testContactId} onChange={(e) => setTestContactId(e.target.value)} className="rounded-lg border border-navy/15 px-3 py-2 text-sm">
            <option value="">Sample data (no real contact)</option>
            {recipients.slice(0, 50).map((r) => (
              <option key={r.contact_id} value={r.contact_id}>{r.name_snapshot || r.email_snapshot}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={runTestSend}
            disabled={testLoading || !testEmail}
            className="self-start rounded-md border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper transition-colors disabled:opacity-60"
          >
            {testLoading ? "Sending…" : "Send Test"}
          </button>
          {testResult && (
            <p className={`text-sm ${testResult.success ? "text-green-700" : "text-red-700"}`}>
              {testResult.success ? "Test email sent." : testResult.error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
