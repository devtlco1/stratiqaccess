"use client";

import { useActionState } from "react";
import { saveSector, type ActionState } from "@/app/actions/admin/sectors";
import { fieldClasses, labelClasses, AdminButton } from "@/components/admin/ui";
import type { Database } from "@/lib/supabase/types";

type Sector = Database["public"]["Tables"]["sectors"]["Row"];
const initialState: ActionState = { status: "idle" };

export function SectorForm({ sector }: { sector?: Sector }) {
  const [state, formAction, pending] = useActionState(saveSector, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {sector && <input type="hidden" name="id" defaultValue={sector.id} />}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="title">Title</label>
          <input className={fieldClasses} id="title" name="title" defaultValue={sector?.title} required />
        </div>
        <div>
          <label className={labelClasses} htmlFor="slug">Slug</label>
          <input className={fieldClasses} id="slug" name="slug" defaultValue={sector?.slug} required />
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="description">Description (optional)</label>
        <textarea className={fieldClasses} id="description" name="description" rows={4} defaultValue={sector?.description ?? ""} />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label className={labelClasses} htmlFor="sort_order">Sort Order</label>
          <input className={fieldClasses} id="sort_order" name="sort_order" type="number" defaultValue={sector?.sort_order ?? 0} />
        </div>
        <div>
          <label className={labelClasses} htmlFor="status">Status</label>
          <select className={fieldClasses} id="status" name="status" defaultValue={sector?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm text-silver-300">
            <input type="checkbox" name="featured" defaultChecked={sector?.featured} />
            Featured
          </label>
        </div>
      </div>

      {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}

      <AdminButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Sector"}
      </AdminButton>
    </form>
  );
}
