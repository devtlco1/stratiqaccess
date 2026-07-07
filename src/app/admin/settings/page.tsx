import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { SiteSettingsRow } from "@/lib/types";
import { updateSiteSettings } from "./actions";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  const settings = data as SiteSettingsRow;

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-navy">Site Settings</h1>
      <p className="mt-2 text-sm text-ink/60">
        These fields drive the brand name, tagline, and contact details shown across the public site.
      </p>

      <form action={updateSiteSettings} className="mt-8 flex flex-col gap-6 max-w-2xl">
        <Field label="Site name" name="name" defaultValue={settings?.name} required />
        <Field label="Tagline" name="tagline" defaultValue={settings?.tagline} required />
        <TextArea label="Description (used for SEO)" name="description" defaultValue={settings?.description} rows={3} />
        <Field label="Contact email" name="email" type="email" defaultValue={settings?.email} required />
        <Field label="Location" name="location" defaultValue={settings?.location} required />

        <button
          type="submit"
          className="self-start rounded-md bg-stratiq-blue px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:bg-navy transition-colors"
        >
          Save
        </button>
      </form>
    </AdminShell>
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

function TextArea({
  label,
  name,
  defaultValue,
  rows = 4,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
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
        className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
      />
    </div>
  );
}
