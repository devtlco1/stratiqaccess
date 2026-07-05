import { AdminButton, AdminTable, EmptyState, StatusBadge } from "@/components/admin/ui";
import { deleteOpportunity } from "@/app/actions/admin/opportunities";
import type { Database, OpportunityKind } from "@/lib/supabase/types";

type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"];

const statusTone: Record<string, "good" | "warn" | "neutral"> = {
  open: "good",
  under_review: "warn",
  awarded: "neutral",
  closed: "neutral",
};

export function OpportunityList({
  kind,
  opportunities,
  basePath,
}: {
  kind: OpportunityKind;
  opportunities: Opportunity[];
  basePath: string;
}) {
  if (opportunities.length === 0) {
    return <EmptyState message={`No ${kind === "tender" ? "tenders" : "investment opportunities"} yet.`} />;
  }

  return (
    <AdminTable columns={["Title", "Buyer", "Status", "Publish", "Featured", ""]}>
      {opportunities.map((op) => (
        <tr key={op.id}>
          <td className="px-4 py-3 text-silver-200">{op.title}</td>
          <td className="px-4 py-3 text-silver-400">{op.buyer ?? "—"}</td>
          <td className="px-4 py-3">
            <StatusBadge tone={statusTone[op.status] ?? "neutral"}>{op.status.replace("_", " ")}</StatusBadge>
          </td>
          <td className="px-4 py-3">
            <StatusBadge tone={op.content_status === "published" ? "good" : "neutral"}>
              {op.content_status}
            </StatusBadge>
          </td>
          <td className="px-4 py-3 text-silver-400">{op.featured ? "Yes" : "—"}</td>
          <td className="px-4 py-3 text-right">
            <div className="flex justify-end gap-3">
              <AdminButton href={`${basePath}/${op.id}`} variant="outline">
                Edit
              </AdminButton>
              <form action={deleteOpportunity.bind(null, op.id, kind)}>
                <AdminButton variant="danger" type="submit">
                  Delete
                </AdminButton>
              </form>
            </div>
          </td>
        </tr>
      ))}
    </AdminTable>
  );
}
