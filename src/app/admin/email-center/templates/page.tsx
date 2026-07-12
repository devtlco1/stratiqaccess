import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import type { EmailTemplateRow } from "@/lib/email/dbTypes";
import { EmailCenterNav } from "../EmailCenterNav";

export default async function TemplatesPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("email_templates").select("*").order("updated_at", { ascending: false });
  const templates = (data ?? []) as EmailTemplateRow[];

  return (
    <AdminShell>
      <EmailCenterNav active="/admin/email-center/templates" />
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-navy">Email Templates</h1>
        <Link
          href="/admin/email-center/templates/new"
          className="rounded-md bg-stratiq-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy transition-colors"
        >
          + New Template
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        {templates.length === 0 && <p className="text-sm text-ink/60">No templates yet — create your first outreach template.</p>}
        {templates.map((template) => (
          <Link
            key={template.id}
            href={`/admin/email-center/templates/${template.id}`}
            className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              <p className="font-medium text-navy">{template.name}</p>
              <p className="text-sm text-ink/60">{template.subject}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-ink/50">Updated {new Date(template.updated_at).toLocaleDateString()}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${template.is_active ? "bg-green-100 text-green-700" : "bg-navy/10 text-navy"}`}>
                {template.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
