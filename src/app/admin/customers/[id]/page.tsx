import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { CustomerRow } from "@/lib/types";
import { CustomerForm } from "../CustomerForm";
import { updateCustomer, deleteCustomer } from "../actions";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("customers").select("*").eq("id", id).single();
  const customer = data as CustomerRow | null;
  if (!customer) notFound();

  const updateWithId = updateCustomer.bind(null, id);
  const deleteWithId = deleteCustomer.bind(null, id);

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Edit Customer</h1>
        <form action={deleteWithId}>
          <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-800">
            Delete
          </button>
        </form>
      </div>
      <CustomerForm customer={customer} action={updateWithId} />
    </AdminShell>
  );
}
