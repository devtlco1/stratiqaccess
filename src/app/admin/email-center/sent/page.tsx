import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { EmailMessageRow } from "@/lib/email/dbTypes";
import { EmailCenterNav } from "../EmailCenterNav";

const PAGE_SIZE = 25;

export default async function SentPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data, count } = await supabase
    .from("email_messages")
    .select("*", { count: "exact" })
    .eq("direction", "outbound")
    .eq("is_draft", false)
    .order("message_date", { ascending: false })
    .range(from, to);

  const messages = (data ?? []) as EmailMessageRow[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <AdminShell>
      <EmailCenterNav active="/admin/email-center/sent" />
      <h1 className="font-display text-2xl text-navy">Sent</h1>

      <div className="mt-8 flex flex-col gap-2">
        {messages.length === 0 && <p className="text-sm text-ink/60">No sent messages yet.</p>}
        {messages.map((message) => (
          <Link
            key={message.id}
            href={`/admin/email-center/inbox/${message.thread_id}`}
            className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-navy">{message.to_emails.join(", ")}</p>
              <p className="truncate text-sm text-ink/60">{message.subject || "(no subject)"}</p>
            </div>
            <span className="shrink-0 text-xs text-ink/50">{new Date(message.message_date).toLocaleString()}</span>
          </Link>
        ))}
      </div>

      {totalPages > 1 && <p className="mt-6 text-center text-sm text-ink/60">Page {page} of {totalPages}</p>}
    </AdminShell>
  );
}
