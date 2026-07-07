import Image from "next/image";
import type { CaseStudyRow } from "@/lib/types";
import { bodyToText } from "@/lib/admin/uploadImage";

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

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-ink/80 mb-1.5">
          Image {caseStudy?.image_url && "(leave empty to keep current image)"}
        </label>
        {caseStudy?.image_url && (
          <div className="relative mb-3 h-32 w-48 overflow-hidden rounded-lg">
            <Image src={caseStudy.image_url} alt="" fill className="object-cover" />
          </div>
        )}
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          className="w-full rounded-lg border border-navy/15 bg-white px-4 py-2.5 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-navy/5 file:px-4 file:py-2 file:text-sm file:font-medium file:text-navy"
        />
      </div>

      <button
        type="submit"
        className="self-start rounded-md bg-stratiq-blue px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-navy transition-colors"
      >
        Save
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
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
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  required?: boolean;
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
        className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm font-mono focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
      />
    </div>
  );
}
