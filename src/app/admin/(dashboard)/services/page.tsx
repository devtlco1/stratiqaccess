import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminButton, AdminTable, EmptyState, StatusBadge } from "@/components/admin/ui";
import { deleteService } from "@/app/actions/admin/services";

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase.from("services").select("*").order("sort_order");

  return (
    <>
      <AdminPageHeader
        title="Services"
        description="The six service pillars shown on the public Services page."
        action={<AdminButton href="/admin/services/new">New Service</AdminButton>}
      />

      {!services || services.length === 0 ? (
        <EmptyState message="No services yet." />
      ) : (
        <AdminTable columns={["Title", "Slug", "Status", "Featured", ""]}>
          {services.map((s) => (
            <tr key={s.id}>
              <td className="px-4 py-3 text-silver-200">{s.title}</td>
              <td className="px-4 py-3 text-silver-400">{s.slug}</td>
              <td className="px-4 py-3">
                <StatusBadge tone={s.status === "published" ? "good" : "neutral"}>{s.status}</StatusBadge>
              </td>
              <td className="px-4 py-3 text-silver-400">{s.featured ? "Yes" : "—"}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-3">
                  <AdminButton href={`/admin/services/${s.id}`} variant="outline">
                    Edit
                  </AdminButton>
                  <form action={deleteService.bind(null, s.id)}>
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
