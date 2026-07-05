import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, StatCard } from "@/components/admin/ui";

async function getCounts() {
  const supabase = await createClient();
  const [leads, opportunities, reports, ndaRequests, users] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("nda_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  return {
    newLeads: leads.count ?? 0,
    openOpportunities: opportunities.count ?? 0,
    publishedReports: reports.count ?? 0,
    pendingNda: ndaRequests.count ?? 0,
    users: users.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const counts = await getCounts();

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="Overview of leads, opportunities, and platform activity."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="New Leads" value={counts.newLeads} />
        <StatCard label="Open Opportunities" value={counts.openOpportunities} />
        <StatCard label="Published Reports" value={counts.publishedReports} />
        <StatCard label="Pending NDA Requests" value={counts.pendingNda} />
        <StatCard label="Users" value={counts.users} />
      </div>
    </>
  );
}
