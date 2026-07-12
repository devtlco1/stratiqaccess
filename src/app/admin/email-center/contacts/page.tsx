import type { ReactNode } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createClient } from "@/lib/supabase/server";
import type { ContactStatus, EmailContactListRow, EmailContactRow } from "@/lib/email/dbTypes";
import { EmailCenterNav } from "../EmailCenterNav";
import { bulkAddToList, bulkRemoveFromList, bulkSuppress, bulkArchive } from "./actions";

const PAGE_SIZE = 25;
const STATUSES: ContactStatus[] = ["active", "unsubscribed", "bounced", "suppressed", "archived"];

const STATUS_STYLES: Record<ContactStatus, string> = {
  active: "bg-green-100 text-green-700",
  unsubscribed: "bg-amber-100 text-amber-700",
  bounced: "bg-red-100 text-red-700",
  suppressed: "bg-red-100 text-red-700",
  archived: "bg-navy/10 text-navy",
};

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; country?: string; sector?: string; source?: string; tag?: string; page?: string }>;
}) {
  const { q, status, country, sector, source, tag, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();

  let query = supabase.from("email_contacts").select("*", { count: "exact" }).order("created_at", { ascending: false });

  if (status && STATUSES.includes(status as ContactStatus)) query = query.eq("status", status);
  if (country) query = query.ilike("country", `%${country}%`);
  if (sector) query = query.ilike("sector", `%${sector}%`);
  if (source) query = query.eq("source", source);
  if (tag) query = query.contains("tags", [tag]);
  if (q && q.trim()) {
    const term = q.trim().replace(/[%,]/g, "");
    query = query.or(`name.ilike.%${term}%,email.ilike.%${term}%,company_name.ilike.%${term}%`);
  }

  const [{ data, count }, { data: listsData }] = await Promise.all([
    query.range(from, to),
    supabase.from("email_contact_lists").select("*").order("name"),
  ]);

  const contacts = (data ?? []) as EmailContactRow[];
  const lists = (listsData ?? []) as EmailContactListRow[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const filterQS = new URLSearchParams();
  if (q) filterQS.set("q", q);
  if (status) filterQS.set("status", status);
  if (country) filterQS.set("country", country);
  if (sector) filterQS.set("sector", sector);
  if (source) filterQS.set("source", source);
  if (tag) filterQS.set("tag", tag);

  return (
    <AdminShell>
      <EmailCenterNav active="/admin/email-center/contacts" />
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Contacts</h1>
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/email-center/contacts/export?${filterQS.toString()}`}
            className="rounded-md border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper transition-colors"
          >
            Export CSV
          </Link>
          <Link
            href="/admin/email-center/contacts/import"
            className="rounded-md border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper transition-colors"
          >
            Import
          </Link>
          <Link
            href="/admin/email-center/contacts/new"
            className="rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors"
          >
            + New Contact
          </Link>
        </div>
      </div>

      <form method="GET" className="mt-6 flex flex-wrap gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name, email, company…"
          className="flex-1 min-w-[220px] rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
        />
        <select name="status" defaultValue={status ?? ""} className="rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20">
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <input type="text" name="country" defaultValue={country ?? ""} placeholder="Country" className="w-36 rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20" />
        <input type="text" name="sector" defaultValue={sector ?? ""} placeholder="Sector" className="w-36 rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20" />
        <input type="text" name="tag" defaultValue={tag ?? ""} placeholder="Tag" className="w-32 rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20" />
        <button type="submit" className="rounded-md border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy hover:bg-paper transition-colors">
          Filter
        </button>
        {(q || status || country || sector || source || tag) && (
          <Link href="/admin/email-center/contacts" className="inline-flex items-center px-3 text-sm font-medium text-ink/60 hover:text-navy transition-colors">
            Clear
          </Link>
        )}
      </form>

      <BulkActionsForm lists={lists} contacts={contacts} />

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} filterQS={filterQS} />}
    </AdminShell>
  );
}

// One shared <form> wraps every checkbox and every bulk-action button.
// Each button overrides the form's submission target via the standard HTML
// `formAction` attribute (Next.js binds a Server Action reference to it),
// so a single set of checked checkboxes can be routed to whichever action
// the admin clicks — no client-side selection state needed.
function BulkActionsForm({ lists, contacts }: { lists: EmailContactListRow[]; contacts: EmailContactRow[] }) {
  return (
    <form className="mt-8 flex flex-col gap-3">
      {contacts.length === 0 && <p className="text-sm text-ink/60">No contacts match your filters yet.</p>}

      {contacts.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
            <span className="text-sm font-medium text-ink/70">Bulk actions on checked contacts:</span>
            <select name="list_id" className="rounded-md border border-navy/15 px-3 py-1.5 text-xs">
              <option value="">Choose a list…</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>{list.name}</option>
              ))}
            </select>
            <ConfirmSubmitButton
              size="sm"
              variant="secondary"
              formAction={bulkAddToList}
              confirmMessage="Add checked contacts to the selected list?"
            >
              Add to List
            </ConfirmSubmitButton>
            <ConfirmSubmitButton
              size="sm"
              variant="secondary"
              formAction={bulkRemoveFromList}
              confirmMessage="Remove checked contacts from the selected list?"
            >
              Remove from List
            </ConfirmSubmitButton>
            <ConfirmSubmitButton
              size="sm"
              variant="danger"
              formAction={bulkSuppress}
              confirmMessage="Suppress checked contacts? They will be excluded from all future campaigns."
            >
              Suppress
            </ConfirmSubmitButton>
            <ConfirmSubmitButton
              size="sm"
              variant="secondary"
              formAction={bulkArchive}
              confirmMessage="Archive checked contacts?"
            >
              Archive
            </ConfirmSubmitButton>
          </div>

          <div className="flex flex-col gap-2">
            {contacts.map((contact) => (
              <ContactRow key={contact.id} contact={contact} />
            ))}
          </div>
        </>
      )}
    </form>
  );
}

function ContactRow({ contact }: { contact: EmailContactRow }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <input type="checkbox" name="ids" value={contact.id} className="size-4 rounded border-navy/30" />
      <Link href={`/admin/email-center/contacts/${contact.id}`} className="flex-1 min-w-0">
        <p className="font-medium text-navy">{contact.name}</p>
        <p className="truncate text-sm text-ink/60">
          {[contact.company_name, contact.email, contact.country].filter(Boolean).join(" · ") || "—"}
        </p>
      </Link>
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[contact.status]}`}>{contact.status}</span>
    </div>
  );
}

function Pagination({ page, totalPages, filterQS }: { page: number; totalPages: number; filterQS: URLSearchParams }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const hrefFor = (p: number) => {
    const qs = new URLSearchParams(filterQS);
    qs.set("page", String(p));
    return `/admin/email-center/contacts?${qs.toString()}`;
  };
  return (
    <div className="mt-8 flex items-center justify-center gap-1.5">
      <PageLinkWrap disabled={page <= 1} href={hrefFor(page - 1)}>← Previous</PageLinkWrap>
      {pages.map((p) => (
        <Link key={p} href={hrefFor(p)} className={`min-w-9 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors ${p === page ? "bg-stratiq-blue text-white" : "text-ink/70 hover:bg-paper"}`}>
          {p}
        </Link>
      ))}
      <PageLinkWrap disabled={page >= totalPages} href={hrefFor(page + 1)}>Next →</PageLinkWrap>
    </div>
  );
}

function PageLinkWrap({ disabled, href, children }: { disabled: boolean; href: string; children: ReactNode }) {
  if (disabled) return <span className="rounded-md px-3 py-2 text-sm font-medium text-ink/30">{children}</span>;
  return (
    <Link href={href} className="rounded-md px-3 py-2 text-sm font-medium text-ink/70 hover:bg-paper transition-colors">
      {children}
    </Link>
  );
}
