"use client";

import { useActionState } from "react";
import { saveReport, type ActionState } from "@/app/actions/admin/reports";
import { fieldClasses, labelClasses, AdminButton } from "@/components/admin/ui";
import type { Database } from "@/lib/supabase/types";

type Report = Database["public"]["Tables"]["reports"]["Row"];
const initialState: ActionState = { status: "idle" };

export function ReportForm({ report }: { report?: Report }) {
  const [state, formAction, pending] = useActionState(saveReport, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {report && <input type="hidden" name="id" defaultValue={report.id} />}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="title">Title</label>
          <input className={fieldClasses} id="title" name="title" defaultValue={report?.title} required />
        </div>
        <div>
          <label className={labelClasses} htmlFor="slug">Slug</label>
          <input className={fieldClasses} id="slug" name="slug" defaultValue={report?.slug} required />
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="description">Description</label>
        <textarea className={fieldClasses} id="description" name="description" rows={4} defaultValue={report?.description ?? ""} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="price">Price</label>
          <input className={fieldClasses} id="price" name="price" type="number" step="0.01" defaultValue={report?.price ?? 0} />
        </div>
        <div>
          <label className={labelClasses} htmlFor="currency">Currency</label>
          <input className={fieldClasses} id="currency" name="currency" defaultValue={report?.currency ?? "USD"} />
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="file">Report File (PDF)</label>
        <input className={fieldClasses} id="file" name="file" type="file" accept=".pdf" />
        {report?.file_path && (
          <p className="mt-2 text-xs text-silver-500">Current file on record: {report.file_path}</p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="status">Status</label>
          <select className={fieldClasses} id="status" name="status" defaultValue={report?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm text-silver-300">
            <input type="checkbox" name="featured" defaultChecked={report?.featured} />
            Featured
          </label>
        </div>
      </div>

      {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}

      <AdminButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Report"}
      </AdminButton>
    </form>
  );
}
