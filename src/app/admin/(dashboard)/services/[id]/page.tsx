import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/ui";
import { ServiceForm } from "@/components/admin/ServiceForm";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: service } = await supabase.from("services").select("*").eq("id", id).single();

  if (!service) notFound();

  return (
    <>
      <AdminPageHeader title="Edit Service" />
      <ServiceForm service={service} />
    </>
  );
}
