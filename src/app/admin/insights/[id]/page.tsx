import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { InsightRow } from "@/lib/types";
import { InsightForm } from "../InsightForm";
import { updateInsight, deleteInsight } from "../actions";

export default async function EditInsightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("insights").select("*").eq("id", id).single();
  const insight = data as InsightRow | null;
  if (!insight) notFound();

  const updateWithId = updateInsight.bind(null, id);
  const deleteWithId = deleteInsight.bind(null, id);

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Edit Article</h1>
        <form action={deleteWithId}>
          <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-800">
            Delete
          </button>
        </form>
      </div>
      <InsightForm insight={insight} action={updateWithId} />
    </AdminShell>
  );
}
