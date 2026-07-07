import Image from "next/image";
import type { ClientRow } from "@/lib/types";

export function ClientForm({
  client,
  action,
}: {
  client?: ClientRow;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="mt-8 flex flex-col gap-6 max-w-2xl">
      <Field label="Client Name" name="name" defaultValue={client?.name} required />
      <Field
        label="Website URL"
        name="website_url"
        type="url"
        defaultValue={client?.website_url ?? undefined}
      />
      <Field
        label="Industry / Category (optional)"
        name="industry"
        defaultValue={client?.industry ?? undefined}
      />

      <div>
        <label htmlFor="logo_url" className="block text-sm font-medium text-ink/80 mb-1.5">
          Logo URL (used if no file is uploaded below)
        </label>
        {client?.logo_url && (
          <div className="relative mb-3 h-16 w-40 overflow-hidden rounded-lg bg-paper">
            <Image src={client.logo_url} alt="" fill className="object-contain" />
          </div>
        )}
        <input
          id="logo_url"
          name="logo_url"
          type="url"
          defaultValue={client?.logo_url ?? undefined}
          placeholder="https://..."
          className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
        />
      </div>

      <div>
        <label htmlFor="logo" className="block text-sm font-medium text-ink/80 mb-1.5">
          Or upload a logo file
        </label>
        <input
          id="logo"
          name="logo"
          type="file"
          accept="image/*"
          className="w-full rounded-lg border border-navy/15 bg-white px-4 py-2.5 text-sm file:mr-4 file:rounded-full file:border-0 file:bg-navy/5 file:px-4 file:py-2 file:text-sm file:font-medium file:text-navy"
        />
      </div>

      <Field
        label="Display Order (lower shows first)"
        name="display_order"
        type="number"
        defaultValue={String(client?.display_order ?? 0)}
      />

      <div className="flex flex-col gap-3">
        <Checkbox label="Featured client" name="is_featured" defaultChecked={client?.is_featured} />
        <Checkbox
          label="Published (visible on the homepage)"
          name="is_published"
          defaultChecked={client ? client.is_published : true}
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
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
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
        className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
      />
    </div>
  );
}

function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm font-medium text-ink/80">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 rounded border-navy/25 text-stratiq-blue focus:ring-stratiq-blue/30"
      />
      {label}
    </label>
  );
}
