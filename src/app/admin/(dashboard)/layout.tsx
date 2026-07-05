import { requireStaff } from "@/lib/admin/require-staff";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireStaff();

  return (
    <div className="flex min-h-screen bg-navy-950">
      <Sidebar />
      <div className="flex-1">
        <AdminTopBar email={user.email ?? profile.email} role={profile.role} />
        <main className="px-6 py-8 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
