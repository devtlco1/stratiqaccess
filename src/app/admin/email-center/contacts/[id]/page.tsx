import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { ConfirmSubmitButton } from "@/components/admin/ConfirmSubmitButton";
import { createClient } from "@/lib/supabase/server";
import type { EmailContactRow, EmailContactListRow } from "@/lib/email/dbTypes";
import { ContactForm } from "../ContactForm";
import { updateContact, deleteContact, archiveContact, bulkAddToList, bulkRemoveFromList } from "../actions";

export default async function EditContactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: contactData }, { data: allLists }, { data: memberships }] = await Promise.all([
    supabase.from("email_contacts").select("*").eq("id", id).single(),
    supabase.from("email_contact_lists").select("*").order("name"),
    supabase.from("email_contact_list_members").select("list_id").eq("contact_id", id),
  ]);

  const contact = contactData as EmailContactRow | null;
  if (!contact) notFound();

  const lists = (allLists ?? []) as EmailContactListRow[];
  const memberListIds = new Set((memberships ?? []).map((m) => m.list_id));

  const updateWithId = updateContact.bind(null, id);
  const deleteWithId = deleteContact.bind(null, id);
  const archiveWithId = archiveContact.bind(null, id);

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Edit Contact</h1>
        <div className="flex items-center gap-4">
          <form action={archiveWithId}>
            <button type="submit" className="text-sm font-medium text-ink/60 hover:text-navy">
              Archive
            </button>
          </form>
          <form action={deleteWithId}>
            <ConfirmSubmitButton
              size="sm"
              variant="danger"
              confirmMessage={`Permanently delete ${contact.name || contact.email}? This cannot be undone.`}
            >
              Delete
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      <ContactForm contact={contact} action={updateWithId} />

      <div className="mt-10 max-w-2xl">
        <h2 className="font-display text-lg text-navy">List Membership</h2>
        {lists.length === 0 ? (
          <p className="mt-3 text-sm text-ink/60">No contact lists yet — create one under Lists first.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {lists.map((list) => {
              const isMember = memberListIds.has(list.id);
              const action = isMember ? bulkRemoveFromList : bulkAddToList;
              return (
                <form key={list.id} action={action} className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
                  <input type="hidden" name="ids" value={id} />
                  <input type="hidden" name="list_id" value={list.id} />
                  <span className="text-sm text-navy">{list.name}</span>
                  <button
                    type="submit"
                    className={`text-xs font-semibold uppercase tracking-wide ${isMember ? "text-red-600 hover:text-red-800" : "text-stratiq-blue hover:text-navy"}`}
                  >
                    {isMember ? "Remove" : "Add"}
                  </button>
                </form>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
