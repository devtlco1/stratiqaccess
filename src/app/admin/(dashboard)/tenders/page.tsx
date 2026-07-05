import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminButton } from "@/components/admin/ui";
import { OpportunityList } from "@/components/admin/OpportunityList";

export default async function AdminTendersPage() {
  const supabase = await createClient();
  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("*")
    .eq("kind", "tender")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminPageHeader
        title="Tenders"
        description="Public and enterprise tender opportunities monitored for clients."
        action={<AdminButton href="/admin/tenders/new">New Tender</AdminButton>}
      />
      <OpportunityList kind="tender" opportunities={opportunities ?? []} basePath="/admin/tenders" />
    </>
  );
}
