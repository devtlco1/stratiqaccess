import { AdminShell } from "@/components/admin/AdminShell";
import { SectorForm } from "../SectorForm";
import { createSector } from "../actions";

export default function NewSectorPage() {
  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-navy">New Sector</h1>
      <SectorForm action={createSector} />
    </AdminShell>
  );
}
