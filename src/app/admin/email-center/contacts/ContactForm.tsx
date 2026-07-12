import { SubmitButton } from "@/components/admin/SubmitButton";
import type { ContactStatus, EmailContactRow } from "@/lib/email/dbTypes";

const STATUSES: ContactStatus[] = ["active", "unsubscribed", "bounced", "suppressed", "archived"];

export function ContactForm({
  contact,
  action,
}: {
  contact?: EmailContactRow;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="mt-8 flex flex-col gap-6 max-w-2xl">
      <Field label="Name" name="name" defaultValue={contact?.name} required />
      <Field label="Email" name="email" type="email" defaultValue={contact?.email} required />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Company" name="company_name" defaultValue={contact?.company_name ?? undefined} />
        <Field label="Job Title" name="job_title" defaultValue={contact?.job_title ?? undefined} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Phone" name="phone" defaultValue={contact?.phone ?? undefined} />
        <Field label="Website" name="website" defaultValue={contact?.website ?? undefined} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Country" name="country" defaultValue={contact?.country ?? undefined} />
        <Field label="City" name="city" defaultValue={contact?.city ?? undefined} />
        <Field label="Sector" name="sector" defaultValue={contact?.sector ?? undefined} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Language" name="language" defaultValue={contact?.language ?? undefined} placeholder="e.g. en, ar" />
        <Field label="Tags (comma separated)" name="tags" defaultValue={contact?.tags?.join(", ")} />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-ink/80 mb-1.5">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={contact?.status ?? "active"}
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
          rows={4}
          defaultValue={contact?.notes ?? undefined}
          className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
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
