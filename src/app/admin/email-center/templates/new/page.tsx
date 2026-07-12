import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { EmailContactRow } from "@/lib/email/dbTypes";
import { TemplateEditor } from "../TemplateEditor";
import { createTemplate } from "../actions";

export default async function NewTemplatePage() {
  const supabase = await createClient();
  const { data } = await supabase.from("email_contacts").select("*").order("name").limit(200);
  const contacts = (data ?? []) as EmailContactRow[];

  return (
    <AdminShell>
      <h1 className="font-display text-2xl text-navy">New Template</h1>
      <TemplateEditor contacts={contacts} action={createTemplate} />
    </AdminShell>
  );
}
