"use client";

import { useActionState } from "react";
import { saveOpportunity, type ActionState } from "@/app/actions/admin/opportunities";
import { fieldClasses, labelClasses, AdminButton } from "@/components/admin/ui";
import type { Database, OpportunityKind } from "@/lib/supabase/types";

type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];
type Sector = Database["public"]["Tables"]["sectors"]["Row"];

const initialState: ActionState = { status: "idle" };

export function OpportunityForm({
  kind,
  opportunity,
  sectors,
}: {
  kind: OpportunityKind;
  opportunity?: Opportunity;
  sectors: Sector[];
}) {
  const [state, formAction, pending] = useActionState(saveOpportunity, initialState);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {opportunity && <input type="hidden" name="id" defaultValue={opportunity.id} />}
      <input type="hidden" name="kind" value={kind} />

      <div>
        <label className={labelClasses} htmlFor="title">Title</label>
        <input className={fieldClasses} id="title" name="title" defaultValue={opportunity?.title} required />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="sector_id">Sector</label>
          <select className={fieldClasses} id="sector_id" name="sector_id" defaultValue={opportunity?.sector_id ?? ""}>
            <option value="">—</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClasses} htmlFor="tender_type">
            {kind === "tender" ? "Tender Type" : "Opportunity Type"}
          </label>
          <input className={fieldClasses} id="tender_type" name="tender_type" defaultValue={opportunity?.tender_type ?? ""} />
        </div>
        <div>
          <label className={labelClasses} htmlFor="buyer">Buyer / Authority</label>
          <input className={fieldClasses} id="buyer" name="buyer" defaultValue={opportunity?.buyer ?? ""} />
        </div>
        <div>
          <label className={labelClasses} htmlFor="location">Location</label>
          <input className={fieldClasses} id="location" name="location" defaultValue={opportunity?.location ?? ""} />
        </div>
        <div>
          <label className={labelClasses} htmlFor="country">Country</label>
          <input className={fieldClasses} id="country" name="country" defaultValue={opportunity?.country ?? "Iraq"} />
        </div>
        <div>
          <label className={labelClasses} htmlFor="deadline">Deadline</label>
          <input className={fieldClasses} id="deadline" name="deadline" type="date" defaultValue={opportunity?.deadline ?? ""} />
        </div>
        <div>
          <label className={labelClasses} htmlFor="status">Status</label>
          <select className={fieldClasses} id="status" name="status" defaultValue={opportunity?.status ?? "open"}>
            <option value="open">Open</option>
            <option value="under_review">Under Review</option>
            <option value="awarded">Awarded</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <label className={labelClasses} htmlFor="price">Price for Download (optional)</label>
          <input className={fieldClasses} id="price" name="price" type="number" step="0.01" defaultValue={opportunity?.price ?? ""} />
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="summary">Short Public Summary</label>
        <textarea className={fieldClasses} id="summary" name="summary" rows={3} defaultValue={opportunity?.summary} required />
      </div>

      <div>
        <label className={labelClasses} htmlFor="confidential_details">Confidential Details</label>
        <textarea
          className={fieldClasses}
          id="confidential_details"
          name="confidential_details"
          rows={6}
          defaultValue={opportunity?.confidential_details ?? ""}
        />
      </div>

      <div>
        <label className={labelClasses} htmlFor="tags">Tags (comma-separated)</label>
        <input className={fieldClasses} id="tags" name="tags" defaultValue={opportunity?.tags?.join(", ") ?? ""} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex items-center gap-2 text-sm text-silver-300">
          <input type="checkbox" name="is_free_preview" defaultChecked={opportunity?.is_free_preview ?? true} />
          Free Preview
        </label>
        <label className="flex items-center gap-2 text-sm text-silver-300">
          <input type="checkbox" name="requires_nda" defaultChecked={opportunity?.requires_nda ?? true} />
          NDA Required
        </label>
        <label className="flex items-center gap-2 text-sm text-silver-300">
          <input type="checkbox" name="featured" defaultChecked={opportunity?.featured} />
          Featured
        </label>
        <div>
          <label className={labelClasses} htmlFor="content_status">Publish Status</label>
          <select className={fieldClasses} id="content_status" name="content_status" defaultValue={opportunity?.content_status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}

      <AdminButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Opportunity"}
      </AdminButton>
    </form>
  );
}
