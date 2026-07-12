import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createClient } from "@/lib/supabase/server";
import type { EmailMessageRow } from "@/lib/email/dbTypes";
import { EmailCenterNav } from "../EmailCenterNav";
import { sendDraftNow, deleteDraft } from "./actions";

export default async function DraftsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("email_messages").select("*").eq("is_draft", true).order("created_at", { ascending: false });
  const drafts = (data ?? []) as EmailMessageRow[];

  return (
    <AdminShell>
      <EmailCenterNav active="/admin/email-center/drafts" />
      <h1 className="font-display text-2xl text-navy">Drafts</h1>

      <div className="mt-8 flex flex-col gap-3">
        {drafts.length === 0 && <p className="text-sm text-ink/60">No drafts saved.</p>}
        {drafts.map((draft) => {
          const sendWithId = sendDraftNow.bind(null, draft.id);
          const deleteWithId = deleteDraft.bind(null, draft.id);
          return (
            <div key={draft.id} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
              <Link href={`/admin/email-center/inbox/${draft.thread_id}`} className="flex-1 min-w-0">
                <p className="truncate font-medium text-navy">{draft.to_emails.join(", ") || "(no recipient)"}</p>
                <p className="truncate text-sm text-ink/60">{draft.subject || "(no subject)"}</p>
              </Link>
              <form action={sendWithId}>
                <ConfirmSubmitButton size="sm" confirmMessage="Send this draft now?">Send Now</ConfirmSubmitButton>
              </form>
              <form action={deleteWithId}>
                <ConfirmSubmitButton size="sm" variant="danger" confirmMessage="Delete this draft?">Delete</ConfirmSubmitButton>
              </form>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
}
