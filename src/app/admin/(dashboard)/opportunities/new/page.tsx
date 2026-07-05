import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/ui";
import { OpportunityForm } from "@/components/admin/OpportunityForm";

export default async function NewOpportunityPage() {
  const supabase = await createClient();
  const { data: sectors } = await supabase.from("sectors").select("*").order("sort_order");

  return (
    <>
      <AdminPageHeader title="New Investment Opportunity" />
      <OpportunityForm kind="investment" sectors={sectors ?? []} />
    </>
  );
}
