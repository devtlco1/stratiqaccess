import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/ui";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").eq("id", 1).single();

  return (
    <>
      <AdminPageHeader title="Site Settings" description="Legal footer, tagline, and contact details used across the public site." />
      {settings && <SiteSettingsForm settings={settings} />}
    </>
  );
}
