import { AdminPageHeader } from "@/components/admin/ui";
import { ServiceForm } from "@/components/admin/ServiceForm";

export default function NewServicePage() {
  return (
    <>
      <AdminPageHeader title="New Service" />
      <ServiceForm />
    </>
  );
}
