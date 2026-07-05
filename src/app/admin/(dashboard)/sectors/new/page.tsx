import { AdminPageHeader } from "@/components/admin/ui";
import { SectorForm } from "@/components/admin/SectorForm";

export default function NewSectorPage() {
  return (
    <>
      <AdminPageHeader title="New Sector" />
      <SectorForm />
    </>
  );
}
