import { AdminShell } from "@/components/admin/AdminShell";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { createList } from "../actions";

export default function NewListPage() {
  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-navy">New Contact List</h1>
      <form action={createList} className="mt-8 flex flex-col gap-6 max-w-xl">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink/80 mb-1.5">Name</label>
          <input
            id="name"
            name="name"
            required
            placeholder="e.g. Energy Companies"
            className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-ink/80 mb-1.5">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
          />
        </div>
        <SubmitButton />
      </form>
    </AdminShell>
  );
}
