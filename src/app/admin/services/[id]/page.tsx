import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { ServiceRow } from "@/lib/types";
import { ServiceForm } from "../ServiceForm";
import { updateService, deleteService } from "../actions";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("*").eq("id", id).single();
  const service = data as ServiceRow | null;
  if (!service) notFound();

  const updateWithId = updateService.bind(null, id);
  const deleteWithId = deleteService.bind(null, id);

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Edit Service</h1>
        <form action={deleteWithId}>
          <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-800">
            Delete
          </button>
        </form>
      </div>
      <ServiceForm service={service} action={updateWithId} />
    </AdminShell>
  );
}
