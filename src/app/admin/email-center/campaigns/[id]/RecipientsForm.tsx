"use client";

import { useRef, useState } from "react";
import type { EmailContactListRow, EmailContactRow } from "@/lib/email/dbTypes";
import type { SyncSummary } from "@/lib/email/campaignRecipients";
import { updateCampaignRecipients } from "../actions";

export function RecipientsForm({
  campaignId,
  contacts,
  lists,
}: {
  campaignId: string;
  contacts: EmailContactRow[];
  lists: EmailContactListRow[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SyncSummary | null>(null);
  const [contactFilter, setContactFilter] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formRef.current) return;
    setLoading(true);
    try {
      const formData = new FormData(formRef.current);
      const result = await updateCampaignRecipients(campaignId, formData);
      setSummary(result ?? null);
    } finally {
      setLoading(false);
    }
  }

  const filteredContacts = contactFilter
    ? contacts.filter((c) => `${c.name} ${c.email} ${c.company_name ?? ""}`.toLowerCase().includes(contactFilter.toLowerCase()))
    : contacts;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <p className="text-sm font-medium text-ink/80 mb-1.5">Contact Lists</p>
        {lists.length === 0 ? (
          <p className="text-sm text-ink/60">No lists yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {lists.map((list) => (
              <label key={list.id} className="flex items-center gap-1.5 text-sm text-ink/80">
                <input type="checkbox" name="list_ids" value={list.id} className="size-4 rounded border-navy/30" />
                {list.name}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <input name="filter_status" placeholder="Filter: status" className="rounded-lg border border-navy/15 px-3 py-2 text-sm" />
        <input name="filter_country" placeholder="Filter: country" className="rounded-lg border border-navy/15 px-3 py-2 text-sm" />
        <input name="filter_sector" placeholder="Filter: sector" className="rounded-lg border border-navy/15 px-3 py-2 text-sm" />
        <input name="filter_tag" placeholder="Filter: tag" className="rounded-lg border border-navy/15 px-3 py-2 text-sm" />
      </div>

      <div>
        <p className="text-sm font-medium text-ink/80 mb-1.5">Individual Contacts</p>
        <input
          type="text"
          value={contactFilter}
          onChange={(e) => setContactFilter(e.target.value)}
          placeholder="Search contacts to check them below…"
          className="mb-2 w-full rounded-lg border border-navy/15 px-3 py-2 text-sm"
        />
        <div className="max-h-48 overflow-y-auto rounded-lg border border-navy/10 p-2">
          {filteredContacts.slice(0, 300).map((contact) => (
            <label key={contact.id} className="flex items-center gap-1.5 py-1 text-sm text-ink/80">
              <input type="checkbox" name="contact_ids" value={contact.id} className="size-4 rounded border-navy/30" />
              {contact.name} <span className="text-ink/50">({contact.email})</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="manual_emails" className="block text-sm font-medium text-ink/80 mb-1.5">
          Manually Entered Emails (one per line or comma-separated)
        </label>
        <textarea
          id="manual_emails"
          name="manual_emails"
          rows={3}
          placeholder={"jane@example.com\njohn@example.com"}
          className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm font-mono focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="self-start rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors disabled:opacity-60"
      >
        {loading ? "Syncing…" : "Sync Recipients"}
      </button>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 rounded-lg bg-paper p-3 text-center text-xs">
          <SummaryStat label="Selected" value={summary.totalSelected} />
          <SummaryStat label="Invalid" value={summary.invalidContacts} />
          <SummaryStat label="Suppressed" value={summary.suppressedContacts} />
          <SummaryStat label="No Name" value={summary.contactsWithoutName} />
          <SummaryStat label="Final Send Count" value={summary.finalSendCount} highlight />
        </div>
      )}
    </form>
  );
}

function SummaryStat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <p className={`font-display text-lg ${highlight ? "text-stratiq-blue" : "text-navy"}`}>{value}</p>
      <p className="text-ink/60">{label}</p>
    </div>
  );
}
