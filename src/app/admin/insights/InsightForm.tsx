import Image from "next/image";
import type { InsightRow } from "@/lib/types";
import { bodyToText } from "@/lib/admin/uploadImage";

export function InsightForm({
  insight,
  action,
}: {
  insight?: InsightRow;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="mt-8 flex flex-col gap-6 max-w-2xl">
      <Field label="Title" name="title" defaultValue={insight?.title} required />
      <Field
        label="URL slug (leave blank to auto-generate from title)"
        name="slug"
        defaultValue={insight?.slug}
      />
      <Field
        label="Published date"
        name="publishedDate"
        type="date"
        defaultValue={insight?.published_date}
        required
      />

      <TextArea
        label="Excerpt (shown on the article card)"
        name="excerpt"
        defaultValue={insight?.excerpt}
        rows={2}
        required
      />

      <TextArea
        label="Body paragraphs (separate paragraphs with a blank line)"
        name="body"
        defaultValue={insight ? bodyToText(insight.body) : ""}
        rows={8}
      />

      <div className="border-t border-navy/10 pt-6 flex flex-col gap-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Arabic translation (optional — falls back to English when left blank)
        </p>

        <Field label="Title (Arabic)" name="titleAr" defaultValue={insight?.title_ar ?? ""} dir="rtl" />

        <TextArea
          label="Excerpt (Arabic)"
          name="excerptAr"
          defaultValue={insight?.excerpt_ar ?? ""}
          rows={2}
          dir="rtl"
        />

        <TextArea
          label="Body paragraphs (Arabic — separate paragraphs with a blank line)"
          name="bodyAr"
          defaultValue={insight && insight.body_ar.length ? bodyToText(insight.body_ar) : ""}
          rows={8}
          dir="rtl"
        />
      </div>

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-ink/80 mb-1.5">
          Image {insight?.image_url && "(leave empty to keep current image)"}
        </label>
        {insight?.image_url && (
          <div className="relative mb-3 h-32 w-48 overflow-hidden rounded-lg">
            <Image src={insight.image_url} alt="" fill className="object-cover" />
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
  type = "text",
  dir,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
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
        type={type}
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
