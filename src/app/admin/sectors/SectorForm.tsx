import Image from "next/image";
import type { SectorRow } from "@/lib/types";
import { bodyToText, highlightsToText } from "@/lib/admin/uploadImage";

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

      <div>
        <label htmlFor="image" className="block text-sm font-medium text-ink/80 mb-1.5">
          Image {sector?.image_url && "(leave empty to keep current image)"}
        </label>
        {sector?.image_url && (
          <div className="relative mb-3 h-32 w-48 overflow-hidden rounded-lg">
            <Image src={sector.image_url} alt="" fill className="object-cover" />
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
