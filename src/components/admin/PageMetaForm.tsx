"use client";

import { useActionState } from "react";
import { savePageMeta, type ActionState } from "@/app/actions/admin/pages";
import { fieldClasses, labelClasses, AdminButton } from "@/components/admin/ui";
import type { Database } from "@/lib/supabase/types";

type Page = Database["public"]["Tables"]["pages"]["Row"];
const initialState: ActionState = { status: "idle" };

export function PageMetaForm({ page }: { page: Page }) {
  const [state, formAction, pending] = useActionState(savePageMeta, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <input type="hidden" name="id" defaultValue={page.id} />

      <div>
        <label className={labelClasses} htmlFor="title">Title</label>
        <input className={fieldClasses} id="title" name="title" defaultValue={page.title} required />
      </div>
      <div>
        <label className={labelClasses} htmlFor="seo_title">SEO Title</label>
        <input className={fieldClasses} id="seo_title" name="seo_title" defaultValue={page.seo_title ?? ""} />
      </div>
      <div>
        <label className={labelClasses} htmlFor="seo_description">SEO Description</label>
        <textarea className={fieldClasses} id="seo_description" name="seo_description" rows={3} defaultValue={page.seo_description ?? ""} />
      </div>
      <div>
        <label className={labelClasses} htmlFor="status">Status</label>
        <select className={fieldClasses} id="status" name="status" defaultValue={page.status}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}
      {state.status === "success" && <p className="text-sm text-emerald-400">Saved.</p>}

      <AdminButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Page"}
      </AdminButton>
    </form>
  );
}
