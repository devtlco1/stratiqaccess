import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminButton, AdminTable, EmptyState, StatusBadge } from "@/components/admin/ui";

export default async function AdminPagesPage() {
  const supabase = await createClient();
  const { data: pages } = await supabase.from("pages").select("*").order("title");

  return (
    <>
      <AdminPageHeader
        title="Pages & Sections"
        description="SEO metadata, publish status, and freeform content sections for each public page."
      />

      {!pages || pages.length === 0 ? (
        <EmptyState message="No pages found. Run supabase/seed.sql." />
      ) : (
        <AdminTable columns={["Title", "Slug", "Status", ""]}>
          {pages.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 text-silver-200">{p.title}</td>
              <td className="px-4 py-3 text-silver-400">/{p.slug}</td>
              <td className="px-4 py-3">
                <StatusBadge tone={p.status === "published" ? "good" : "neutral"}>{p.status}</StatusBadge>
              </td>
              <td className="px-4 py-3 text-right">
                <AdminButton href={`/admin/pages/${p.id}`} variant="outline">
                  Manage
                </AdminButton>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </>
  );
}
