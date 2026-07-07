import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { MessageRow } from "@/lib/types";
import { markMessageRead, deleteMessage } from "./actions";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });
  const messages = (data ?? []) as MessageRow[];
  const unreadCount = messages.filter((m) => !m.is_read).length;

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
      <h1 className="font-display text-2xl text-navy">
        Messages {unreadCount > 0 && <span className="text-stratiq-blue">({unreadCount} unread)</span>}
      </h1>

      <div className="mt-8 flex flex-col gap-4">
        {messages.length === 0 && (
          <p className="text-sm text-ink/60">No messages yet — submissions from the Contact form will appear here.</p>
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

              <div className="mt-4 flex gap-4">
                <form action={markRead}>
                  <button type="submit" className="text-sm font-medium text-stratiq-blue hover:text-navy">
                    Mark as {message.is_read ? "unread" : "read"}
                  </button>
                </form>
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
    </AdminShell>
  );
}
