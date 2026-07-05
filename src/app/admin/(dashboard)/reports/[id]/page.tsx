import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/ui";
import { ReportForm } from "@/components/admin/ReportForm";

export default async function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: report } = await supabase.from("reports").select("*").eq("id", id).single();

  if (!report) notFound();

  return (
    <>
      <AdminPageHeader title="Edit Report" />
      <ReportForm report={report} />
    </>
  );
}
