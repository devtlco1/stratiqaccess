import { AdminShell } from "@/components/admin/AdminShell";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createCampaignDraft } from "../actions";

export default function NewCampaignPage() {
  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-navy">New Campaign</h1>
      <p className="mt-2 text-sm text-ink/60">Step 1 of 9 — name and describe this campaign. You will choose recipients, template, and content next.</p>

      <form action={createCampaignDraft} className="mt-8 flex flex-col gap-6 max-w-xl">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink/80 mb-1.5">Campaign Name</label>
          <input
            id="name"
            name="name"
            required
            placeholder="e.g. Q3 Energy Sector Outreach"
            className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-ink/80 mb-1.5">Internal Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
          />
        </div>
        <SubmitButton>Create Draft</SubmitButton>
      </form>
    </AdminShell>
  );
}
