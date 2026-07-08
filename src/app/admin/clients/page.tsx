import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminThumbnail } from "@/components/admin/AdminThumbnail";
import { createClient } from "@/lib/supabase/server";
import type { ClientRow } from "@/lib/types";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("clients")
    .select("*")
    .order("display_order", { ascending: true });
  const clients = (data ?? []) as ClientRow[];

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Clients</h1>
        <Link
          href="/admin/clients/new"
          className="rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors"
        >
          + New Client
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {clients.length === 0 && (
          <p className="text-sm text-ink/60">No clients yet — add your first one.</p>
        )}
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/admin/clients/${client.id}`}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <AdminThumbnail src={client.logo_url} alt={client.name} fit="contain" />
            <div className="flex-1">
              <p className="font-medium text-navy">{client.name}</p>
              <p className="text-sm text-ink/60">
                {client.industry || "—"} · Order {client.display_order}
              </p>
            </div>
            <div className="flex gap-2">
              {client.is_featured && (
                <span className="rounded-full bg-stratiq-blue/10 px-3 py-1 text-xs font-semibold text-stratiq-blue">
                  Featured
                </span>
              )}
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  client.is_published ? "bg-green-100 text-green-700" : "bg-ink/10 text-ink/60"
                }`}
              >
                {client.is_published ? "Published" : "Unpublished"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
