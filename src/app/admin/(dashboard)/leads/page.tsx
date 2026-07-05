import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminTable, EmptyState, StatusBadge } from "@/components/admin/ui";
import { updateLeadStatus } from "@/app/actions/admin/leads";

export default async function AdminLeadsPage() {
  const supabase = await createClient();
  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminPageHeader
        title="Leads & Submissions"
        description="Every contact and inquiry form submission across the site lands here."
      />

      {!leads || leads.length === 0 ? (
        <EmptyState message="No inquiries yet." />
      ) : (
        <AdminTable columns={["Company", "Contact", "Email", "Interest", "Form", "Status", ""]}>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td className="px-4 py-3 text-silver-200">{lead.company_name ?? "—"}</td>
              <td className="px-4 py-3 text-silver-400">{lead.contact_person ?? "—"}</td>
              <td className="px-4 py-3 text-silver-400">{lead.email}</td>
              <td className="px-4 py-3 text-silver-400">{lead.service_interest ?? "—"}</td>
              <td className="px-4 py-3 text-silver-500">{lead.form_type}</td>
              <td className="px-4 py-3">
                <StatusBadge tone={lead.status === "new" ? "warn" : lead.status === "archived" ? "neutral" : "good"}>
                  {lead.status}
                </StatusBadge>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  {lead.status !== "reviewed" && (
                    <form action={updateLeadStatus.bind(null, lead.id, "reviewed")}>
                      <button className="text-xs uppercase tracking-wide text-gold-400 hover:text-gold-300">
                        Mark Reviewed
                      </button>
                    </form>
                  )}
                  {lead.status !== "archived" && (
                    <form action={updateLeadStatus.bind(null, lead.id, "archived")}>
                      <button className="text-xs uppercase tracking-wide text-silver-400 hover:text-silver-200">
                        Archive
                      </button>
                    </form>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </>
  );
}
