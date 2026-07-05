import { saveSection, deleteSection } from "@/app/actions/admin/pages";
import { fieldClasses, labelClasses, AdminButton } from "@/components/admin/ui";
import type { Database } from "@/lib/supabase/types";

type Section = Database["public"]["Tables"]["page_sections"]["Row"];

function SectionRow({ pageId, section }: { pageId: string; section?: Section }) {
  return (
    <form action={saveSection} className="space-y-4 border border-white/10 bg-navy-900/50 p-6">
      <input type="hidden" name="page_id" value={pageId} />
      {section && <input type="hidden" name="id" defaultValue={section.id} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClasses} htmlFor={`key-${section?.id ?? "new"}`}>Section Key</label>
          <input
            className={fieldClasses}
            id={`key-${section?.id ?? "new"}`}
            name="key"
            defaultValue={section?.key}
            placeholder="e.g. hero, who-we-are"
            required
          />
        </div>
        <div>
          <label className={labelClasses} htmlFor={`sort-${section?.id ?? "new"}`}>Sort Order</label>
          <input className={fieldClasses} id={`sort-${section?.id ?? "new"}`} name="sort_order" type="number" defaultValue={section?.sort_order ?? 0} />
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-2 text-sm text-silver-300">
            <input type="checkbox" name="is_hidden" defaultChecked={section?.is_hidden} />
            Hidden
          </label>
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor={`heading-${section?.id ?? "new"}`}>Heading</label>
        <input className={fieldClasses} id={`heading-${section?.id ?? "new"}`} name="heading" defaultValue={section?.heading ?? ""} />
      </div>

      <div>
        <label className={labelClasses} htmlFor={`body-${section?.id ?? "new"}`}>Body</label>
        <textarea className={fieldClasses} id={`body-${section?.id ?? "new"}`} name="body" rows={4} defaultValue={section?.body ?? ""} />
      </div>

      <div className="flex gap-3">
        <AdminButton type="submit">{section ? "Save Section" : "Add Section"}</AdminButton>
        {section && (
          <form action={deleteSection.bind(null, section.id, pageId)}>
            <AdminButton variant="danger" type="submit">
              Delete
            </AdminButton>
          </form>
        )}
      </div>
    </form>
  );
}

export function SectionEditor({ pageId, sections }: { pageId: string; sections: Section[] }) {
  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <SectionRow key={section.id} pageId={pageId} section={section} />
      ))}
      <SectionRow pageId={pageId} />
    </div>
  );
}
