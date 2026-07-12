import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { EmailContactListRow } from "@/lib/email/dbTypes";
import { EmailCenterNav } from "../EmailCenterNav";

export default async function ListsPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("email_contact_lists").select("*, email_contact_list_members(count)").order("name");
  const lists = (data ?? []) as (EmailContactListRow & { email_contact_list_members: { count: number }[] })[];

  return (
    <AdminShell>
      <EmailCenterNav active="/admin/email-center/lists" />
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Contact Lists</h1>
        <Link
          href="/admin/email-center/lists/new"
          className="rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors"
        >
          + New List
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {lists.length === 0 && (
          <p className="text-sm text-ink/60">
            No lists yet — create reusable lists like &ldquo;International Companies&rdquo; or &ldquo;Existing Clients&rdquo; to group contacts for campaigns.
          </p>
        )}
        {lists.map((list) => (
          <Link
            key={list.id}
            href={`/admin/email-center/lists/${list.id}`}
            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <p className="font-medium text-navy">{list.name}</p>
              {list.description && <p className="text-sm text-ink/60">{list.description}</p>}
            </div>
            <span className="rounded-full bg-navy/10 px-3 py-1 text-xs font-semibold text-navy">
              {list.email_contact_list_members?.[0]?.count ?? 0} contacts
            </span>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
