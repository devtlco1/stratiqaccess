import { notFound } from "next/navigation";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createClient } from "@/lib/supabase/server";
import type { EmailContactListRow, EmailContactRow } from "@/lib/email/dbTypes";
import { updateList, deleteList, removeMemberFromList } from "../actions";

export default async function EditListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: listData }, { data: memberRows }] = await Promise.all([
    supabase.from("email_contact_lists").select("*").eq("id", id).single(),
    supabase.from("email_contact_list_members").select("contact_id, email_contacts(*)").eq("list_id", id),
  ]);

  const list = listData as EmailContactListRow | null;
  if (!list) notFound();

  const members = (memberRows ?? [])
    .map((row) => row.email_contacts as unknown as EmailContactRow)
    .filter(Boolean);

  const updateWithId = updateList.bind(null, id);
  const deleteWithId = deleteList.bind(null, id);

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Edit List</h1>
        <form action={deleteWithId}>
          <ConfirmSubmitButton size="sm" variant="danger" confirmMessage={`Delete the list "${list.name}"? Contacts themselves are not deleted.`}>
            Delete List
          </ConfirmSubmitButton>
        </form>
      </div>

      <form action={updateWithId} className="mt-8 flex flex-col gap-6 max-w-xl">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink/80 mb-1.5">Name</label>
          <input
            id="name"
            name="name"
            defaultValue={list.name}
            required
            className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-ink/80 mb-1.5">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={list.description ?? undefined}
            className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
          />
        </div>
        <SubmitButton />
      </form>

      <div className="mt-10 max-w-2xl">
        <h2 className="font-display text-lg text-navy">Members ({members.length})</h2>
        {members.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">
            No members yet — add contacts to this list from the Contacts page.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {members.map((contact) => {
              const removeAction = removeMemberFromList.bind(null, id, contact.id);
              return (
                <div key={contact.id} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
                  <Link href={`/admin/email-center/contacts/${contact.id}`} className="text-sm">
                    <span className="font-medium text-navy">{contact.name}</span>{" "}
                    <span className="text-ink/60">{contact.email}</span>
                  </Link>
                  <form action={removeAction}>
                    <button type="submit" className="text-xs font-semibold uppercase tracking-wide text-red-600 hover:text-red-800">
                      Remove
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
