import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { SectorRow } from "@/lib/types";
import { SectorForm } from "../SectorForm";
import { updateSector, deleteSector } from "../actions";

export default async function EditSectorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("sectors").select("*").eq("id", id).single();
  const sector = data as SectorRow | null;
  if (!sector) notFound();

  const updateWithId = updateSector.bind(null, id);
  const deleteWithId = deleteSector.bind(null, id);

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Edit Sector</h1>
        <form action={deleteWithId}>
          <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-800">
            Delete
          </button>
        </form>
      </div>
      <SectorForm sector={sector} action={updateWithId} />
    </AdminShell>
  );
}
