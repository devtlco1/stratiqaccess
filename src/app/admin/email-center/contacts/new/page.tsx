import { AdminShell } from "@/components/admin/AdminShell";
import { ContactForm } from "../ContactForm";
import { createContact } from "../actions";

export default function NewContactPage() {
  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-navy">New Contact</h1>
      <ContactForm action={createContact} />
    </AdminShell>
  );
}
