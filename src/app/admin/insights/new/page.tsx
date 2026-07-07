import { AdminShell } from "@/components/admin/AdminShell";
import { InsightForm } from "../InsightForm";
import { createInsight } from "../actions";

export default function NewInsightPage() {
  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-navy">New Article</h1>
      <InsightForm action={createInsight} />
    </AdminShell>
  );
}
