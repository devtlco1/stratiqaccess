import type { ClientRow } from "@/lib/types";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ClientLogoField } from "./ClientLogoField";

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

      <ClientLogoField currentUrl={client?.logo_url} />

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
