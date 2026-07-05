import { AdminPageHeader } from "@/components/admin/ui";
import { ReportForm } from "@/components/admin/ReportForm";

export default function NewReportPage() {
  return (
    <>
      <AdminPageHeader title="New Report" />
      <ReportForm />
    </>
  );
}
