import Link from "next/link";
import Image from "next/image";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { SectorRow } from "@/lib/types";

export default async function AdminSectorsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sectors")
    .select("*")
    .order("sort_order", { ascending: true });
  const sectors = (data ?? []) as SectorRow[];

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Sectors</h1>
        <Link
          href="/admin/sectors/new"
          className="rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors"
        >
          + New Sector
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {sectors.length === 0 && (
          <p className="text-sm text-ink/60">No sectors yet — add your first one.</p>
        )}
        {sectors.map((sector) => (
          <Link
            key={sector.id}
            href={`/admin/sectors/${sector.id}`}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-navy/5">
              {sector.image_url && (
                <Image src={sector.image_url} alt={sector.title} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-navy">{sector.title}</p>
              <p className="text-sm text-ink/60">/{sector.slug}</p>
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
