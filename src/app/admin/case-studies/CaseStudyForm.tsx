import type { CaseStudyRow } from "@/lib/types";
import { bodyToText } from "@/lib/admin/uploadImage";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageField } from "@/components/admin/ImageField";

export function CaseStudyForm({
  caseStudy,
  action,
}: {
  caseStudy?: CaseStudyRow;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="mt-8 flex flex-col gap-6 max-w-2xl">
      <Field label="Title" name="title" defaultValue={caseStudy?.title} required />
      <Field
        label="URL slug (leave blank to auto-generate from title)"
        name="slug"
        defaultValue={caseStudy?.slug}
      />
      <Field label="Sector label" name="sector" defaultValue={caseStudy?.sector} required />

      <TextArea
        label="Summary (shown on the case study card)"
        name="summary"
        defaultValue={caseStudy?.summary}
        rows={2}
        required
      />

      <TextArea
        label="Body paragraphs (separate paragraphs with a blank line)"
        name="body"
        defaultValue={caseStudy ? bodyToText(caseStudy.body) : ""}
        rows={6}
      />

      <div className="border-t border-navy/10 pt-6 flex flex-col gap-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Arabic translation (optional — falls back to English when left blank)
        </p>

        <Field label="Title (Arabic)" name="titleAr" defaultValue={caseStudy?.title_ar ?? ""} dir="rtl" />
        <Field label="Sector label (Arabic)" name="sectorAr" defaultValue={caseStudy?.sector_ar ?? ""} dir="rtl" />

        <TextArea
          label="Summary (Arabic)"
          name="summaryAr"
          defaultValue={caseStudy?.summary_ar ?? ""}
          rows={2}
          dir="rtl"
        />

        <TextArea
          label="Body paragraphs (Arabic — separate paragraphs with a blank line)"
          name="bodyAr"
          defaultValue={caseStudy && caseStudy.body_ar.length ? bodyToText(caseStudy.body_ar) : ""}
          rows={6}
          dir="rtl"
        />
      </div>

      <ImageField label="Image" currentUrl={caseStudy?.image_url} />

      <SubmitButton />
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  dir,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink/80 mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        dir={dir}
        className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
      />
    </div>
  );
}

function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
  required,
  dir,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  required?: boolean;
  dir?: "rtl" | "ltr";
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink/80 mb-1.5">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        required={required}
        dir={dir}
        className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm font-mono focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
      />
    </div>
  );
}
