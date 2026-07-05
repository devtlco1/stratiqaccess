import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminTable, EmptyState } from "@/components/admin/ui";
import { updateUserRole } from "@/app/actions/admin/users";
import type { UserRole } from "@/lib/supabase/types";

const roles: UserRole[] = ["admin", "editor", "client", "visitor"];

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <>
      <AdminPageHeader
        title="Users"
        description="Manage platform roles. New sign-ups default to Client."
      />

      {!users || users.length === 0 ? (
        <EmptyState message="No users yet." />
      ) : (
        <AdminTable columns={["Email", "Name", "Role", ""]}>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-3 text-silver-200">{u.email}</td>
              <td className="px-4 py-3 text-silver-400">{u.full_name ?? "—"}</td>
              <td className="px-4 py-3 text-silver-400 capitalize">{u.role}</td>
              <td className="px-4 py-3 text-right">
                <form action={async (formData) => {
                  "use server";
                  const role = formData.get("role") as UserRole;
                  await updateUserRole(u.id, role);
                }} className="flex justify-end gap-2">
                  <select
                    name="role"
                    defaultValue={u.role}
                    className="border border-white/15 bg-navy-900/50 px-3 py-1.5 text-xs text-silver-200"
                  >
                    {roles.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <button className="border border-white/15 px-3 py-1.5 text-xs uppercase tracking-wide text-silver-300 hover:border-gold-500/40 hover:text-gold-400">
                    Update
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </>
  );
}
