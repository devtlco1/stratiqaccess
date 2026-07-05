import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/ui";
import { PageMetaForm } from "@/components/admin/PageMetaForm";
import { SectionEditor } from "@/components/admin/SectionEditor";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: page }, { data: sections }] = await Promise.all([
    supabase.from("pages").select("*").eq("id", id).single(),
    supabase.from("page_sections").select("*").eq("page_id", id).order("sort_order"),
  ]);

  if (!page) notFound();

  return (
    <>
      <AdminPageHeader title={`Manage: ${page.title}`} description="Page metadata and freeform content sections." />

      <div className="space-y-12">
        <section>
          <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-gold-400">Page Metadata</h2>
          <PageMetaForm page={page} />
        </section>

        <section>
          <h2 className="mb-4 text-xs uppercase tracking-[0.2em] text-gold-400">Sections</h2>
          <SectionEditor pageId={page.id} sections={sections ?? []} />
        </section>
      </div>
    </>
  );
}
