import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminButton, AdminTable, EmptyState, StatusBadge } from "@/components/admin/ui";
import { deleteReport } from "@/app/actions/admin/reports";

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminPageHeader
        title="Paid Reports"
        description="Downloadable tender intelligence and market reports available for purchase."
        action={<AdminButton href="/admin/reports/new">New Report</AdminButton>}
      />

      {!reports || reports.length === 0 ? (
        <EmptyState message="No reports yet." />
      ) : (
        <AdminTable columns={["Title", "Price", "Status", "Featured", ""]}>
          {reports.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3 text-silver-200">{r.title}</td>
              <td className="px-4 py-3 text-silver-400">{r.currency} {Number(r.price).toFixed(2)}</td>
              <td className="px-4 py-3">
                <StatusBadge tone={r.status === "published" ? "good" : "neutral"}>{r.status}</StatusBadge>
              </td>
              <td className="px-4 py-3 text-silver-400">{r.featured ? "Yes" : "—"}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-3">
                  <AdminButton href={`/admin/reports/${r.id}`} variant="outline">
                    Edit
                  </AdminButton>
                  <form action={deleteReport.bind(null, r.id)}>
                    <AdminButton variant="danger" type="submit">
                      Delete
                    </AdminButton>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </>
  );
}
