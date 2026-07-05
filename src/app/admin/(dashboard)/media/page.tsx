import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminTable, EmptyState } from "@/components/admin/ui";
import { MediaUploadForm } from "@/components/admin/MediaUploadForm";
import { deleteMedia } from "@/app/actions/admin/media";

export default async function AdminMediaPage() {
  const supabase = await createClient();
  const { data: media } = await supabase
    .from("media")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminPageHeader title="Media Library" description="Images, PDFs, and files used across the site." />

      <div className="mb-8">
        <MediaUploadForm />
      </div>

      {!media || media.length === 0 ? (
        <EmptyState message="No files uploaded yet." />
      ) : (
        <AdminTable columns={["File", "Type", "Size", ""]}>
          {media.map((m) => (
            <tr key={m.id}>
              <td className="px-4 py-3 text-silver-200">{m.file_name}</td>
              <td className="px-4 py-3 text-silver-400">{m.mime_type ?? "—"}</td>
              <td className="px-4 py-3 text-silver-400">
                {m.size_bytes ? `${Math.round(m.size_bytes / 1024)} KB` : "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <form action={deleteMedia.bind(null, m.id, m.file_path)}>
                  <button className="text-xs uppercase tracking-wide text-red-400 hover:text-red-300">
                    Delete
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </>
  );
}
