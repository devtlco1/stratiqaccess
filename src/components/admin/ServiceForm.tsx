"use client";

import { useActionState } from "react";
import { saveService, type ActionState } from "@/app/actions/admin/services";
import { fieldClasses, labelClasses, AdminButton } from "@/components/admin/ui";
import type { Database } from "@/lib/supabase/types";

type Service = Database["public"]["Tables"]["services"]["Row"];

const initialState: ActionState = { status: "idle" };

export function ServiceForm({ service }: { service?: Service }) {
  const [state, formAction, pending] = useActionState(saveService, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {service && <input type="hidden" name="id" defaultValue={service.id} />}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="title">Title</label>
          <input className={fieldClasses} id="title" name="title" defaultValue={service?.title} required />
        </div>
        <div>
          <label className={labelClasses} htmlFor="slug">Slug</label>
          <input className={fieldClasses} id="slug" name="slug" defaultValue={service?.slug} required />
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="summary">Summary</label>
        <textarea className={fieldClasses} id="summary" name="summary" rows={3} defaultValue={service?.summary} required />
      </div>

      <div>
        <label className={labelClasses} htmlFor="body">Full Description (optional)</label>
        <textarea className={fieldClasses} id="body" name="body" rows={6} defaultValue={service?.body ?? ""} />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label className={labelClasses} htmlFor="sort_order">Sort Order</label>
          <input className={fieldClasses} id="sort_order" name="sort_order" type="number" defaultValue={service?.sort_order ?? 0} />
        </div>
        <div>
          <label className={labelClasses} htmlFor="status">Status</label>
          <select className={fieldClasses} id="status" name="status" defaultValue={service?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm text-silver-300">
            <input type="checkbox" name="featured" defaultChecked={service?.featured} />
            Featured
          </label>
        </div>
      </div>

      {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}

      <AdminButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Service"}
      </AdminButton>
    </form>
  );
}
