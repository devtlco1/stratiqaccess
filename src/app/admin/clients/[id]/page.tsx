import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { ClientRow } from "@/lib/types";
import { ClientForm } from "../ClientForm";
import { updateClientRow, deleteClientRow } from "../actions";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("*").eq("id", id).single();
  const client = data as ClientRow | null;
  if (!client) notFound();

  const updateWithId = updateClientRow.bind(null, id);
  const deleteWithId = deleteClientRow.bind(null, id);

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Edit Client</h1>
        <form action={deleteWithId}>
          <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-800">
            Delete
          </button>
        </form>
      </div>
      <ClientForm client={client} action={updateWithId} />
    </AdminShell>
  );
}
