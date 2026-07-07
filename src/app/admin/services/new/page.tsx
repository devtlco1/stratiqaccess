import { AdminShell } from "@/components/admin/AdminShell";
import { ServiceForm } from "../ServiceForm";
import { createService } from "../actions";

export default function NewServicePage() {
  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-navy">New Service</h1>
      <ServiceForm action={createService} />
    </AdminShell>
  );
}
