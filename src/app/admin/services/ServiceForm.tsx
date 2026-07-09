import type { ServiceRow } from "@/lib/types";
import { bodyToText, highlightsToText, faqToText } from "@/lib/admin/uploadImage";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageField } from "@/components/admin/ImageField";

const ICONS = [
  "compass", "radar", "shield-check", "handshake", "landmark", "flask-conical",
  "briefcase", "truck", "bolt", "building-2", "hard-hat", "heart-pulse", "cpu",
  "shield", "package", "file-search", "trending-up", "mail", "map-pin", "globe",
  "phone", "users", "file-check", "scale", "calendar", "key", "languages",
];

export function ServiceForm({
  service,
  action,
}: {
  service?: ServiceRow;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="mt-8 flex flex-col gap-6 max-w-2xl">
      <Field label="Title" name="title" defaultValue={service?.title} required />
      <Field
        label="URL slug (leave blank to auto-generate from title)"
        name="slug"
        defaultValue={service?.slug}
      />

      <div>
        <label htmlFor="icon" className="block text-sm font-medium text-ink/80 mb-1.5">
          Icon
        </label>
        <select
          id="icon"
          name="icon"
          defaultValue={service?.icon ?? "compass"}
          className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm bg-white"
        >
          {ICONS.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center gap-2.5 text-sm font-medium text-ink/80">
        <input
          type="checkbox"
          name="isFeatured"
          value="true"
          defaultChecked={service?.is_featured ?? false}
          className="size-4 rounded border-navy/25 text-stratiq-blue focus:ring-stratiq-blue/30"
        />
        Featured (shown in the homepage Top Services section — keep this to 6 services)
      </label>

      <TextArea
        label="Short description (shown on the service card)"
        name="description"
        defaultValue={service?.description}
        rows={2}
        required
      />

      <TextArea
        label="Body paragraphs (separate paragraphs with a blank line)"
        name="body"
        defaultValue={service ? bodyToText(service.body) : ""}
        rows={6}
      />

      <TextArea
        label='"This Service Includes" bullets — one per line, format: Title | Description'
        name="highlights"
        defaultValue={service ? highlightsToText(service.highlights) : ""}
        rows={4}
      />

      <TextArea
        label="FAQ — one per line, format: Question | Answer (optional)"
        name="faq"
        defaultValue={service ? faqToText(service.faq) : ""}
        rows={4}
      />

      <div className="border-t border-navy/10 pt-6 flex flex-col gap-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Arabic translation (optional — falls back to English when left blank)
        </p>

        <Field label="Title (Arabic)" name="titleAr" defaultValue={service?.title_ar ?? ""} dir="rtl" />

        <TextArea
          label="Short description (Arabic)"
          name="descriptionAr"
          defaultValue={service?.description_ar ?? ""}
          rows={2}
          dir="rtl"
        />

        <TextArea
          label="Body paragraphs (Arabic — separate paragraphs with a blank line)"
          name="bodyAr"
          defaultValue={service && service.body_ar.length ? bodyToText(service.body_ar) : ""}
          rows={6}
          dir="rtl"
        />

        <TextArea
          label="Includes bullets (Arabic) — one per line, format: Title | Description"
          name="highlightsAr"
          defaultValue={service && service.highlights_ar.length ? highlightsToText(service.highlights_ar) : ""}
          rows={4}
          dir="rtl"
        />

        <TextArea
          label="FAQ (Arabic) — one per line, format: Question | Answer"
          name="faqAr"
          defaultValue={service && service.faq_ar.length ? faqToText(service.faq_ar) : ""}
          rows={4}
          dir="rtl"
        />
      </div>

      <ImageField label="Image" currentUrl={service?.image_url} />

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
