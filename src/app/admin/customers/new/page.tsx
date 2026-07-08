import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { MessageRow } from "@/lib/types";
import { CustomerForm } from "../CustomerForm";
import { createCustomer } from "../actions";

export default async function NewCustomerPage({
  searchParams,
}: {
  searchParams: Promise<{ fromMessage?: string }>;
}) {
  const { fromMessage } = await searchParams;

  let defaults:
    | {
        name?: string;
        company?: string;
        email?: string;
        phone?: string;
        source?: string;
        notes?: string;
        source_message_id?: string;
      }
    | undefined;

  if (fromMessage) {
    const supabase = await createClient();
    const { data } = await supabase.from("messages").select("*").eq("id", fromMessage).single();
    const message = data as MessageRow | null;
    if (message) {
      defaults = {
        name: `${message.first_name} ${message.last_name}`.trim(),
        company: message.company_name,
        email: message.email,
        phone: message.phone ?? undefined,
        source: "Website Contact Form",
        notes: message.message,
        source_message_id: message.id,
      };
    }
  }

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-navy">New Customer</h1>
      <CustomerForm defaults={defaults} action={createCustomer} />
    </AdminShell>
  );
}
