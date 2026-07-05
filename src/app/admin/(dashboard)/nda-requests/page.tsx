import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminTable, EmptyState, StatusBadge } from "@/components/admin/ui";
import { updateNdaStatus } from "@/app/actions/admin/leads";
import type { Database } from "@/lib/supabase/types";

type NdaRequestWithOpportunity = Database["public"]["Tables"]["nda_requests"]["Row"] & {
  opportunities: Pick<Database["public"]["Tables"]["opportunities"]["Row"], "title"> | null;
};

export default async function AdminNdaRequestsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase
    .from("nda_requests")
    .select("*, opportunities(title)")
    .order("created_at", { ascending: false })
    .returns<NdaRequestWithOpportunity[]>();

  return (
    <>
      <AdminPageHeader
        title="NDA Requests"
        description="Requests for full access to confidential tender and opportunity details."
      />

      {!requests || requests.length === 0 ? (
        <EmptyState message="No NDA access requests yet." />
      ) : (
        <AdminTable columns={["Opportunity", "Company", "Email", "Status", ""]}>
          {requests.map((req) => (
            <tr key={req.id}>
              <td className="px-4 py-3 text-silver-200">
                {req.opportunities?.title ?? "—"}
              </td>
              <td className="px-4 py-3 text-silver-400">{req.company_name}</td>
              <td className="px-4 py-3 text-silver-400">{req.email}</td>
              <td className="px-4 py-3">
                <StatusBadge tone={req.status === "pending" ? "warn" : req.status === "approved" ? "good" : "bad"}>
                  {req.status}
                </StatusBadge>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  {req.status !== "approved" && (
                    <form action={updateNdaStatus.bind(null, req.id, "approved")}>
                      <button className="text-xs uppercase tracking-wide text-emerald-400 hover:text-emerald-300">
                        Approve
                      </button>
                    </form>
                  )}
                  {req.status !== "rejected" && (
                    <form action={updateNdaStatus.bind(null, req.id, "rejected")}>
                      <button className="text-xs uppercase tracking-wide text-red-400 hover:text-red-300">
                        Reject
                      </button>
                    </form>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </>
  );
}
