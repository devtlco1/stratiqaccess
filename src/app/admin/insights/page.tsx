import Link from "next/link";
import Image from "next/image";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { InsightRow } from "@/lib/types";

export default async function AdminInsightsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("insights")
    .select("*")
    .order("published_date", { ascending: false });
  const insights = (data ?? []) as InsightRow[];

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Insights</h1>
        <Link
          href="/admin/insights/new"
          className="rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors"
        >
          + New Article
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {insights.length === 0 && (
          <p className="text-sm text-ink/60">No articles yet — add your first one.</p>
        )}
        {insights.map((insight) => (
          <Link
            key={insight.id}
            href={`/admin/insights/${insight.id}`}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-navy/5">
              {insight.image_url && (
                <Image src={insight.image_url} alt={insight.title} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-navy">{insight.title}</p>
              <p className="text-sm text-ink/60">{insight.published_date} · /{insight.slug}</p>
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
