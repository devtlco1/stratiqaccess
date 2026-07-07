import { AdminShell } from "@/components/admin/AdminShell";
import { ClientForm } from "../ClientForm";
import { createClientRow } from "../actions";

export default function NewClientPage() {
  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-navy">New Client</h1>
      <ClientForm action={createClientRow} />
    </AdminShell>
  );
}
