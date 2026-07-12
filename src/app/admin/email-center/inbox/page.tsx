import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import { getMailboxResourceId } from "@/lib/hostinger/mailbox";
import { listFolders } from "@/lib/hostinger/folders";
import { listMessages, searchMessages } from "@/lib/hostinger/messages";
import { HostingerApiError } from "@/lib/hostinger/types";
import { EmailCenterNav } from "../EmailCenterNav";

const PAGE_SIZE = 25;

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ folder?: string; q?: string; page?: string }>;
}) {
  const { folder: folderParam, q, page: pageParam } = await searchParams;
  const folder = folderParam || "INBOX";
  const page = Math.max(1, Number(pageParam) || 1);

  const supabase = await createClient();

  let mailboxResourceId: string;
  try {
    mailboxResourceId = await getMailboxResourceId(supabase);
  } catch (error) {
    return (
      <AdminShell>
        <EmailCenterNav active="/admin/email-center/inbox" />
        <h1 className="font-display text-2xl text-navy">Inbox</h1>
        <ConnectionError error={error} />
      </AdminShell>
    );
  }

  try {
    const [folders, messageResult] = await Promise.all([
      listFolders(mailboxResourceId),
      q?.trim()
        ? searchMessages(mailboxResourceId, folder, { text: q.trim() }, { page, perPage: PAGE_SIZE, sort: "-date" })
        : listMessages(mailboxResourceId, folder, { page, perPage: PAGE_SIZE, sort: "-uid" }),
    ]);

    const { messages, pagination } = messageResult;

    return (
      <AdminShell>
        <EmailCenterNav active="/admin/email-center/inbox" />
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl text-navy">Inbox</h1>
          <Link href="/admin/email-center/inbox/compose" className="rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors">
            Compose
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {folders.map((f) => (
            <Link
              key={f.path}
              href={`/admin/email-center/inbox?folder=${encodeURIComponent(f.path)}`}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${f.path === folder ? "bg-stratiq-blue text-white" : "bg-paper text-ink/70 hover:bg-navy/10"}`}
            >
              {f.name} {f.unreadCount > 0 && `(${f.unreadCount})`}
            </Link>
          ))}
        </div>

        <form method="GET" className="mt-4 flex gap-3">
          <input type="hidden" name="folder" value={folder} />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search this folder…"
            className="flex-1 rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
          />
          <button type="submit" className="rounded-md border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper transition-colors">
            Search
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2">
          {messages.length === 0 && <p className="text-sm text-ink/60">No messages in this folder.</p>}
          {messages.map((message) => (
            <Link
              key={message.uid}
              href={`/admin/email-center/inbox/open?folder=${encodeURIComponent(folder)}&uid=${message.uid}`}
              className={`flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow ${message.unseen ? "ring-2 ring-stratiq-blue/30" : ""}`}
            >
              {message.unseen && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-stratiq-blue" />}
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-navy">{message.from?.name || message.from?.address || "Unknown sender"}</p>
                <p className="truncate text-sm text-ink/60">{message.subject || "(no subject)"}</p>
              </div>
              {message.attachments.length > 0 && <span className="text-xs text-ink/40">📎</span>}
              <span className="shrink-0 text-xs text-ink/50">{new Date(message.date).toLocaleDateString()}</span>
            </Link>
          ))}
        </div>

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-ink/60">
            Page {pagination.page} of {pagination.totalPages}
          </div>
        )}
      </AdminShell>
    );
  } catch (error) {
    return (
      <AdminShell>
        <EmailCenterNav active="/admin/email-center/inbox" />
        <h1 className="font-display text-2xl text-navy">Inbox</h1>
        <ConnectionError error={error} />
      </AdminShell>
    );
  }
}

function ConnectionError({ error }: { error: unknown }) {
  const message = error instanceof HostingerApiError ? `${error.code}: ${error.message}` : error instanceof Error ? error.message : "Unknown error";
  return (
    <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
      Could not reach the Hostinger mailbox: {message}. Check{" "}
      <Link href="/admin/email-center/settings" className="underline">Settings</Link> for connection status.
    </div>
  );
}
