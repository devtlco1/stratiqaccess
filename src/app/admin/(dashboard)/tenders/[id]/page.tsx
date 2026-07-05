import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/ui";
import { OpportunityForm } from "@/components/admin/OpportunityForm";

export default async function EditTenderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: opportunity }, { data: sectors }] = await Promise.all([
    supabase.from("opportunities").select("*").eq("id", id).single(),
    supabase.from("sectors").select("*").order("sort_order"),
  ]);

  if (!opportunity) notFound();

  return (
    <>
      <AdminPageHeader title="Edit Tender" />
      <OpportunityForm kind="tender" opportunity={opportunity} sectors={sectors ?? []} />
    </>
  );
}
