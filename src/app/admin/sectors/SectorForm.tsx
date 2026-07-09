import type { SectorRow } from "@/lib/types";
import { bodyToText, highlightsToText } from "@/lib/admin/uploadImage";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ImageField } from "@/components/admin/ImageField";

const ICONS = [
  "bolt", "building-2", "hard-hat", "heart-pulse", "cpu", "shield", "truck", "package",
  "compass", "radar", "shield-check", "handshake", "landmark", "flask-conical", "briefcase",
];

export function SectorForm({
  sector,
  action,
}: {
  sector?: SectorRow;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="mt-8 flex flex-col gap-6 max-w-2xl">
      <Field label="Title" name="title" defaultValue={sector?.title} required />
      <Field
        label="URL slug (leave blank to auto-generate from title)"
        name="slug"
        defaultValue={sector?.slug}
      />

      <div>
        <label htmlFor="icon" className="block text-sm font-medium text-ink/80 mb-1.5">
          Icon
        </label>
        <select
          id="icon"
          name="icon"
          defaultValue={sector?.icon ?? "bolt"}
          className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm bg-white"
        >
          {ICONS.map((icon) => (
            <option key={icon} value={icon}>
              {icon}
            </option>
          ))}
        </select>
      </div>

      <TextArea
        label="Short description (shown on the sector card)"
        name="description"
        defaultValue={sector?.description}
        rows={2}
        required
      />

      <TextArea
        label="Body paragraphs (separate paragraphs with a blank line)"
        name="body"
        defaultValue={sector ? bodyToText(sector.body) : ""}
        rows={6}
      />

      <TextArea
        label='"Our [Sector] Services Include" bullets — one per line, format: Title | Description'
        name="highlights"
        defaultValue={sector ? highlightsToText(sector.highlights) : ""}
        rows={4}
      />

      <div className="border-t border-navy/10 pt-6 flex flex-col gap-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          Arabic translation (optional — falls back to English when left blank)
        </p>

        <Field label="Title (Arabic)" name="titleAr" defaultValue={sector?.title_ar ?? ""} dir="rtl" />

        <TextArea
          label="Short description (Arabic)"
          name="descriptionAr"
          defaultValue={sector?.description_ar ?? ""}
          rows={2}
          dir="rtl"
        />

        <TextArea
          label="Body paragraphs (Arabic — separate paragraphs with a blank line)"
          name="bodyAr"
          defaultValue={sector && sector.body_ar.length ? bodyToText(sector.body_ar) : ""}
          rows={6}
          dir="rtl"
        />

        <TextArea
          label="Includes bullets (Arabic) — one per line, format: Title | Description"
          name="highlightsAr"
          defaultValue={sector && sector.highlights_ar.length ? highlightsToText(sector.highlights_ar) : ""}
          rows={4}
          dir="rtl"
        />
      </div>

      <ImageField label="Image" currentUrl={sector?.image_url} />

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
