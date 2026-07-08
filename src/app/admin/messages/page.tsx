import type { ReactNode } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { MessageRow } from "@/lib/types";
import { markMessageRead, deleteMessage } from "./actions";

const PAGE_SIZE = 10;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; page?: string }>;
}) {
  const { tab: tabParam, page: pageParam } = await searchParams;
  const tab = tabParam === "read" ? "read" : "unread";
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  const [{ count: unreadCount }, { count: readCount }, { data, count: totalCount }] = await Promise.all([
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false),
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("is_read", true),
    supabase
      .from("messages")
      .select("*", { count: "exact" })
      .eq("is_read", tab === "read")
      .order("created_at", { ascending: false })
      .range(from, to),
  ]);

  const messages = (data ?? []) as MessageRow[];
  const totalPages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE));

  const signedRfpUrls = new Map<string, string>();
  await Promise.all(
    messages
      .filter((m) => m.rfp_file_url)
      .map(async (m) => {
        const { data } = await supabase.storage
          .from("rfp-files")
          .createSignedUrl(m.rfp_file_url!, 60 * 60 * 24 * 365 * 10); // effectively permanent (10 years)
        if (data?.signedUrl) signedRfpUrls.set(m.id, data.signedUrl);
      })
  );

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-navy">Messages</h1>

      <div className="mt-6 flex gap-2 border-b border-navy/10">
        <TabLink tab="unread" active={tab === "unread"} count={unreadCount ?? 0} />
        <TabLink tab="read" active={tab === "read"} count={readCount ?? 0} />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {messages.length === 0 && (
          <p className="text-sm text-ink/60">
            {tab === "unread" ? "No unread messages." : "No read messages yet."}
          </p>
        )}
        {messages.map((message) => {
          const markRead = markMessageRead.bind(null, message.id, !message.is_read);
          const remove = deleteMessage.bind(null, message.id);

          return (
            <div
              key={message.id}
              className={`rounded-xl bg-white p-6 shadow-sm ${!message.is_read ? "ring-2 ring-stratiq-blue/40" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-navy">
                    {message.first_name} {message.last_name}
                    {message.job_title && <span className="text-ink/50"> · {message.job_title}</span>}
                  </p>
                  <p className="text-sm text-ink/60">
                    {message.company_name} · {message.country}
                  </p>
                  <a href={`mailto:${message.email}`} className="text-sm text-stratiq-blue hover:underline">
                    {message.email}
                  </a>
                  {message.phone && <span className="text-sm text-ink/60"> · {message.phone}</span>}
                </div>
                <div className="flex items-center gap-3 text-xs text-ink/50">
                  <span>{new Date(message.created_at).toLocaleString()}</span>
                </div>
              </div>

              <p className="mt-4 text-sm text-ink/80 leading-relaxed whitespace-pre-wrap">{message.message}</p>

              {signedRfpUrls.has(message.id) && (
                <a
                  href={signedRfpUrls.get(message.id)}
                  target="_blank"
                  className="mt-3 inline-block text-sm text-stratiq-blue hover:underline"
                >
                  View attached RFP file ↗
                </a>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <form action={markRead}>
                  <button type="submit" className="text-sm font-medium text-stratiq-blue hover:text-navy">
                    Mark as {message.is_read ? "unread" : "read"}
                  </button>
                </form>
                <Link
                  href={`/admin/customers/new?fromMessage=${message.id}`}
                  className="text-sm font-medium text-stratiq-blue hover:text-navy"
                >
                  Add to Customers
                </Link>
                <form action={remove}>
                  <button type="submit" className="text-sm font-medium text-red-600 hover:text-red-800">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && <Pagination tab={tab} page={page} totalPages={totalPages} />}
    </AdminShell>
  );
}

function TabLink({ tab, active, count }: { tab: "unread" | "read"; active: boolean; count: number }) {
  return (
    <Link
      href={`/admin/messages?tab=${tab}`}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
        active ? "border-stratiq-blue text-navy" : "border-transparent text-ink/50 hover:text-navy"
      }`}
    >
      {tab === "unread" ? "Unread" : "Read"} {count > 0 && <span>({count})</span>}
    </Link>
  );
}

function Pagination({ tab, page, totalPages }: { tab: string; page: number; totalPages: number }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="mt-8 flex items-center justify-center gap-1.5">
      <PageLink tab={tab} page={page - 1} disabled={page <= 1}>
        ← Previous
      </PageLink>
      {pages.map((p) => (
        <Link
          key={p}
          href={`/admin/messages?tab=${tab}&page=${p}`}
          className={`min-w-9 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors ${
            p === page ? "bg-stratiq-blue text-white" : "text-ink/70 hover:bg-paper"
          }`}
        >
          {p}
        </Link>
      ))}
      <PageLink tab={tab} page={page + 1} disabled={page >= totalPages}>
        Next →
      </PageLink>
    </div>
  );
}

function PageLink({
  tab,
  page,
  disabled,
  children,
}: {
  tab: string;
  page: number;
  disabled: boolean;
  children: ReactNode;
}) {
  if (disabled) {
    return <span className="rounded-md px-3 py-2 text-sm font-medium text-ink/30">{children}</span>;
  }
  return (
    <Link
      href={`/admin/messages?tab=${tab}&page=${page}`}
      className="rounded-md px-3 py-2 text-sm font-medium text-ink/70 hover:bg-paper transition-colors"
    >
      {children}
    </Link>
  );
}
