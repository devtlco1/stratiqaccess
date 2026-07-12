import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { ActivityActorType, EmailActivityLogRow } from "@/lib/email/dbTypes";
import { EmailCenterNav } from "../EmailCenterNav";

const PAGE_SIZE = 50;
const ACTOR_TYPES: ActivityActorType[] = ["user", "system", "webhook", "cron"];

export default async function ActivityLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ actor?: string; entity?: string; page?: string }>;
}) {
  const { actor, entity, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  let query = supabase.from("email_activity_logs").select("*", { count: "exact" }).order("created_at", { ascending: false });

  if (actor && ACTOR_TYPES.includes(actor as ActivityActorType)) query = query.eq("actor_type", actor);
  if (entity) query = query.eq("entity_type", entity);

  const { data, count } = await query.range(from, to);
  const logs = (data ?? []) as EmailActivityLogRow[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <AdminShell>
      <EmailCenterNav active="/admin/email-center/logs" />
      <h1 className="font-display text-2xl text-navy">Activity Logs</h1>

      <form method="GET" className="mt-6 flex flex-wrap gap-3">
        <select name="actor" defaultValue={actor ?? ""} className="rounded-lg border border-navy/15 px-4 py-2.5 text-sm">
          <option value="">All actor types</option>
          {ACTOR_TYPES.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <input name="entity" defaultValue={entity ?? ""} placeholder="Entity type (e.g. email_campaign)" className="rounded-lg border border-navy/15 px-4 py-2.5 text-sm" />
        <button type="submit" className="rounded-md border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper transition-colors">
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-paper text-left text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink/60">No activity recorded yet.</td>
              </tr>
            )}
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-navy/5">
                <td className="px-4 py-2.5 text-ink/60">{new Date(log.created_at).toLocaleString()}</td>
                <td className="px-4 py-2.5 capitalize">{log.actor_type}</td>
                <td className="px-4 py-2.5 font-medium text-navy">{log.action}</td>
                <td className="px-4 py-2.5 text-ink/70">{log.entity_type}</td>
                <td className="px-4 py-2.5 text-ink/50">{JSON.stringify(log.metadata)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && <p className="mt-6 text-center text-sm text-ink/60">Page {page} of {totalPages}</p>}
    </AdminShell>
  );
}
