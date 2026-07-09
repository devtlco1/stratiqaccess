import type { InsightRow } from "@/lib/types";
import { bodyToText, faqToText } from "@/lib/admin/uploadImage";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageField } from "@/components/admin/ImageField";

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
        label='Body paragraphs (separate with a blank line; start a line with "## " to render it as a section heading)'
        name="body"
        defaultValue={insight ? bodyToText(insight.body) : ""}
        rows={8}
      />

      <TextArea
        label="FAQ — one per line, format: Question | Answer (optional)"
        name="faq"
        defaultValue={insight ? faqToText(insight.faq) : ""}
        rows={4}
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

        <TextArea
          label="FAQ (Arabic) — one per line, format: Question | Answer"
          name="faqAr"
          defaultValue={insight && insight.faq_ar.length ? faqToText(insight.faq_ar) : ""}
          rows={4}
          dir="rtl"
        />
      </div>

      <ImageField label="Image" currentUrl={insight?.image_url} />

      <SubmitButton />
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
