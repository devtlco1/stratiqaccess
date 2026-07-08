import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminThumbnail } from "@/components/admin/AdminThumbnail";
import { createClient } from "@/lib/supabase/server";
import type { ServiceRow } from "@/lib/types";

export default async function AdminServicesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });
  const services = (data ?? []) as ServiceRow[];

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Services</h1>
        <Link
          href="/admin/services/new"
          className="rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors"
        >
          + New Service
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {services.length === 0 && (
          <p className="text-sm text-ink/60">No services yet — add your first one.</p>
        )}
        {services.map((service) => (
          <Link
            key={service.id}
            href={`/admin/services/${service.id}`}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <AdminThumbnail src={service.image_url} alt={service.title} />
            <div className="flex-1">
              <p className="font-medium text-navy">{service.title}</p>
              <p className="text-sm text-ink/60">/{service.slug}</p>
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
