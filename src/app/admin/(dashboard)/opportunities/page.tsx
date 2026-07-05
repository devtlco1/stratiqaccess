import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminButton } from "@/components/admin/ui";
import { OpportunityList } from "@/components/admin/OpportunityList";

export default async function AdminOpportunitiesPage() {
  const supabase = await createClient();
  const { data: opportunities } = await supabase
    .from("opportunities")
    .select("*")
    .eq("kind", "investment")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminPageHeader
        title="Investment Opportunities"
        description="Structured investment opportunities presented to qualified clients."
        action={<AdminButton href="/admin/opportunities/new">New Opportunity</AdminButton>}
      />
      <OpportunityList kind="investment" opportunities={opportunities ?? []} basePath="/admin/opportunities" />
    </>
  );
}
