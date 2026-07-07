import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { CaseStudyRow } from "@/lib/types";
import { CaseStudyForm } from "../CaseStudyForm";
import { updateCaseStudy, deleteCaseStudy } from "../actions";

export default async function EditCaseStudyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("case_studies").select("*").eq("id", id).single();
  const caseStudy = data as CaseStudyRow | null;
  if (!caseStudy) notFound();

  const updateWithId = updateCaseStudy.bind(null, id);
  const deleteWithId = deleteCaseStudy.bind(null, id);

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Edit Case Study</h1>
        <form action={deleteWithId}>
          <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-800">
            Delete
          </button>
        </form>
      </div>
      <CaseStudyForm caseStudy={caseStudy} action={updateWithId} />
    </AdminShell>
  );
}
