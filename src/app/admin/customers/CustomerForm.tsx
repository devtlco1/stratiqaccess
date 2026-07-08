import type { CustomerRow, CustomerStatus } from "@/lib/types";

const STATUSES: CustomerStatus[] = ["New", "Contacted", "Qualified", "In Progress", "Won", "Lost"];

export function CustomerForm({
  customer,
  defaults,
  action,
}: {
  customer?: CustomerRow;
  defaults?: {
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    source?: string;
    notes?: string;
    source_message_id?: string;
  };
  action: (formData: FormData) => void;
}) {
  const initial = customer ?? defaults ?? {};

  return (
    <form action={action} className="mt-8 flex flex-col gap-6 max-w-2xl">
      {initial.source_message_id && (
        <input type="hidden" name="source_message_id" value={initial.source_message_id} />
      )}

      <Field label="Name" name="name" defaultValue={initial.name} required />
      <Field label="Company" name="company" defaultValue={initial.company ?? undefined} />
      <Field label="Email" name="email" type="email" defaultValue={initial.email ?? undefined} />
      <Field label="Phone" name="phone" defaultValue={initial.phone ?? undefined} />
      <Field
        label="Source"
        name="source"
        defaultValue={initial.source ?? undefined}
        placeholder="e.g. Website Contact Form, Referral, Event"
      />

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-ink/80 mb-1.5">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={customer?.status ?? "New"}
          className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
        >
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-ink/80 mb-1.5">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={5}
          defaultValue={initial.notes ?? undefined}
          className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
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
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
      />
    </div>
  );
}
