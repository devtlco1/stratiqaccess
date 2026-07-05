"use client";

import { useActionState } from "react";
import { saveArticle, type ActionState } from "@/app/actions/admin/articles";
import { fieldClasses, labelClasses, AdminButton } from "@/components/admin/ui";
import type { Database } from "@/lib/supabase/types";

type Article = Database["public"]["Tables"]["articles"]["Row"];
type Sector = Database["public"]["Tables"]["sectors"]["Row"];
const initialState: ActionState = { status: "idle" };

export function ArticleForm({ article, sectors }: { article?: Article; sectors: Sector[] }) {
  const [state, formAction, pending] = useActionState(saveArticle, initialState);

  return (
    <form action={formAction} className="max-w-3xl space-y-6">
      {article && <input type="hidden" name="id" defaultValue={article.id} />}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="title">Title</label>
          <input className={fieldClasses} id="title" name="title" defaultValue={article?.title} required />
        </div>
        <div>
          <label className={labelClasses} htmlFor="slug">Slug</label>
          <input className={fieldClasses} id="slug" name="slug" defaultValue={article?.slug} required />
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="excerpt">Excerpt</label>
        <textarea className={fieldClasses} id="excerpt" name="excerpt" rows={2} defaultValue={article?.excerpt ?? ""} />
      </div>

      <div>
        <label className={labelClasses} htmlFor="body">Body</label>
        <textarea className={fieldClasses} id="body" name="body" rows={10} defaultValue={article?.body ?? ""} />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label className={labelClasses} htmlFor="sector_id">Related Sector</label>
          <select className={fieldClasses} id="sector_id" name="sector_id" defaultValue={article?.sector_id ?? ""}>
            <option value="">—</option>
            {sectors.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClasses} htmlFor="status">Status</label>
          <select className={fieldClasses} id="status" name="status" defaultValue={article?.status ?? "draft"}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm text-silver-300">
            <input type="checkbox" name="featured" defaultChecked={article?.featured} />
            Featured
          </label>
        </div>
      </div>

      {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}

      <AdminButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Article"}
      </AdminButton>
    </form>
  );
}
