"use client";

import { useActionState } from "react";
import { saveSiteSettings, type ActionState } from "@/app/actions/admin/settings";
import { fieldClasses, labelClasses, AdminButton } from "@/components/admin/ui";
import type { Database } from "@/lib/supabase/types";

type SiteSettings = Database["public"]["Tables"]["site_settings"]["Row"];
const initialState: ActionState = { status: "idle" };

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(saveSiteSettings, initialState);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="site_name">Site Name</label>
          <input className={fieldClasses} id="site_name" name="site_name" defaultValue={settings.site_name} required />
        </div>
        <div>
          <label className={labelClasses} htmlFor="contact_email">Contact Email</label>
          <input className={fieldClasses} id="contact_email" name="contact_email" type="email" defaultValue={settings.contact_email} required />
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="tagline">Tagline</label>
        <input className={fieldClasses} id="tagline" name="tagline" defaultValue={settings.tagline} required />
      </div>

      <div>
        <label className={labelClasses} htmlFor="disclosure_notice">Disclosure Notice</label>
        <textarea className={fieldClasses} id="disclosure_notice" name="disclosure_notice" rows={2} defaultValue={settings.disclosure_notice} required />
      </div>

      <div>
        <label className={labelClasses} htmlFor="legal_footer">Legal Footer</label>
        <textarea className={fieldClasses} id="legal_footer" name="legal_footer" rows={2} defaultValue={settings.legal_footer} required />
      </div>

      <div>
        <label className={labelClasses} htmlFor="legal_footer_extended">Legal Footer (Extended)</label>
        <textarea
          className={fieldClasses}
          id="legal_footer_extended"
          name="legal_footer_extended"
          rows={4}
          defaultValue={settings.legal_footer_extended ?? ""}
        />
      </div>

      {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}
      {state.status === "success" && <p className="text-sm text-emerald-400">Settings saved.</p>}

      <AdminButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save Settings"}
      </AdminButton>
    </form>
  );
}
