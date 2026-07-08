import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminThumbnail } from "@/components/admin/AdminThumbnail";
import { createClient } from "@/lib/supabase/server";
import type { CaseStudyRow } from "@/lib/types";

export default async function AdminCaseStudiesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("case_studies")
    .select("*")
    .order("sort_order", { ascending: true });
  const caseStudies = (data ?? []) as CaseStudyRow[];

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Case Studies</h1>
        <Link
          href="/admin/case-studies/new"
          className="rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors"
        >
          + New Case Study
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {caseStudies.length === 0 && (
          <p className="text-sm text-ink/60">No case studies yet — add your first one.</p>
        )}
        {caseStudies.map((study) => (
          <Link
            key={study.id}
            href={`/admin/case-studies/${study.id}`}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <AdminThumbnail src={study.image_url} alt={study.title} />
            <div className="flex-1">
              <p className="font-medium text-navy">{study.title}</p>
              <p className="text-sm text-ink/60">{study.sector} · /{study.slug}</p>
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
