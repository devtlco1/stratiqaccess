import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/ui";
import { SectorForm } from "@/components/admin/SectorForm";

export default async function EditSectorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: sector } = await supabase.from("sectors").select("*").eq("id", id).single();

  if (!sector) notFound();

  return (
    <>
      <AdminPageHeader title="Edit Sector" />
      <SectorForm sector={sector} />
    </>
  );
}
