import { AdminShell } from "@/components/admin/AdminShell";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import type { EmailSuppressionRow, SuppressionReason } from "@/lib/email/dbTypes";
import { EmailCenterNav } from "../EmailCenterNav";
import { addSuppression, restoreSuppression } from "./actions";

const REASONS: SuppressionReason[] = ["unsubscribed", "bounced_hard", "bounced_soft", "complaint", "manual", "invalid"];

export default async function SuppressionPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("email_suppression_list").select("*").eq("is_active", true).order("created_at", { ascending: false });
  const suppressions = (data ?? []) as EmailSuppressionRow[];

  return (
    <AdminShell>
      <EmailCenterNav active="/admin/email-center/suppression" />
      <h1 className="font-display text-2xl text-navy">Suppression List</h1>
      <p className="mt-2 text-sm text-ink/60">
        Suppressed addresses are excluded from every campaign and checked again immediately before each individual send.
      </p>

      <form action={addSuppression} className="mt-6 flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 shadow-sm">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-ink/70 mb-1">Email</label>
          <input name="email" type="email" required className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/70 mb-1">Reason</label>
          <select name="reason" defaultValue="manual" className="rounded-lg border border-navy/15 px-3 py-2 text-sm">
            {REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-ink/70 mb-1">Notes</label>
          <input name="notes" className="w-full rounded-lg border border-navy/15 px-3 py-2 text-sm" />
        </div>
        <SubmitButton size="sm">Suppress</SubmitButton>
      </form>

      <div className="mt-6 flex flex-col gap-2">
        {suppressions.length === 0 && <p className="text-sm text-ink/60">No suppressed addresses.</p>}
        {suppressions.map((s) => {
          const restoreWithId = restoreSuppression.bind(null, s.id);
          return (
            <div key={s.id} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-navy">{s.original_email}</p>
                <p className="text-xs text-ink/50">
                  {s.reason} · {s.source || "—"} · {new Date(s.created_at).toLocaleDateString()} {s.notes ? `· ${s.notes}` : ""}
                </p>
              </div>
              <form action={restoreWithId}>
                <ConfirmSubmitButton size="sm" variant="secondary" confirmMessage={`Restore ${s.original_email}? They will become eligible for future campaigns again.`}>
                  Restore
                </ConfirmSubmitButton>
              </form>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
