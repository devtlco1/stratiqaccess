import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminButton, AdminTable, EmptyState, StatusBadge } from "@/components/admin/ui";
import { deleteArticle } from "@/app/actions/admin/articles";

export default async function AdminInsightsPage() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminPageHeader
        title="Insights / Articles"
        description="Iraq market briefs and tender updates published on the public Insights page."
        action={<AdminButton href="/admin/insights/new">New Article</AdminButton>}
      />

      {!articles || articles.length === 0 ? (
        <EmptyState message="No articles yet." />
      ) : (
        <AdminTable columns={["Title", "Slug", "Status", "Featured", ""]}>
          {articles.map((a) => (
            <tr key={a.id}>
              <td className="px-4 py-3 text-silver-200">{a.title}</td>
              <td className="px-4 py-3 text-silver-400">{a.slug}</td>
              <td className="px-4 py-3">
                <StatusBadge tone={a.status === "published" ? "good" : "neutral"}>{a.status}</StatusBadge>
              </td>
              <td className="px-4 py-3 text-silver-400">{a.featured ? "Yes" : "—"}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-3">
                  <AdminButton href={`/admin/insights/${a.id}`} variant="outline">
                    Edit
                  </AdminButton>
                  <form action={deleteArticle.bind(null, a.id)}>
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
