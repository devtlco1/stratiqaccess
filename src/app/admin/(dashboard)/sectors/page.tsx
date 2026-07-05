import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminButton, AdminTable, EmptyState, StatusBadge } from "@/components/admin/ui";
import { deleteSector } from "@/app/actions/admin/sectors";

export default async function AdminSectorsPage() {
  const supabase = await createClient();
  const { data: sectors } = await supabase.from("sectors").select("*").order("sort_order");

  return (
    <>
      <AdminPageHeader
        title="Sectors"
        description="Strategic sectors shown on the public Sectors page."
        action={<AdminButton href="/admin/sectors/new">New Sector</AdminButton>}
      />

      {!sectors || sectors.length === 0 ? (
        <EmptyState message="No sectors yet." />
      ) : (
        <AdminTable columns={["Title", "Slug", "Status", "Featured", ""]}>
          {sectors.map((s) => (
            <tr key={s.id}>
              <td className="px-4 py-3 text-silver-200">{s.title}</td>
              <td className="px-4 py-3 text-silver-400">{s.slug}</td>
              <td className="px-4 py-3">
                <StatusBadge tone={s.status === "published" ? "good" : "neutral"}>{s.status}</StatusBadge>
              </td>
              <td className="px-4 py-3 text-silver-400">{s.featured ? "Yes" : "—"}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-3">
                  <AdminButton href={`/admin/sectors/${s.id}`} variant="outline">
                    Edit
                  </AdminButton>
                  <form action={deleteSector.bind(null, s.id)}>
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
