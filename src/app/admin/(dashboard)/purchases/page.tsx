import { createClient } from "@/lib/supabase/server";
import { AdminPageHeader, AdminTable, EmptyState, StatusBadge } from "@/components/admin/ui";
import { approvePurchase, rejectPurchase } from "@/app/actions/admin/purchases";
import type { Database } from "@/lib/supabase/types";

type PurchaseWithBuyer = Database["public"]["Tables"]["purchases"]["Row"] & {
  profiles: Pick<Database["public"]["Tables"]["profiles"]["Row"], "email"> | null;
};

export default async function AdminPurchasesPage() {
  const supabase = await createClient();
  const { data: purchases } = await supabase
    .from("purchases")
    .select("*, profiles(email)")
    .order("created_at", { ascending: false })
    .returns<PurchaseWithBuyer[]>();

  return (
    <>
      <AdminPageHeader
        title="Purchases"
        description="Report and opportunity purchases, including manual payment approvals."
      />

      {!purchases || purchases.length === 0 ? (
        <EmptyState message="No purchases yet." />
      ) : (
        <AdminTable columns={["Buyer", "Item", "Amount", "Method", "Status", ""]}>
          {purchases.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 text-silver-200">
                {p.profiles?.email ?? "—"}
              </td>
              <td className="px-4 py-3 text-silver-400">{p.item_type}</td>
              <td className="px-4 py-3 text-silver-400">{p.currency} {Number(p.amount).toFixed(2)}</td>
              <td className="px-4 py-3 text-silver-400">{p.payment_method}</td>
              <td className="px-4 py-3">
                <StatusBadge tone={p.status === "approved" ? "good" : p.status === "rejected" ? "bad" : "warn"}>
                  {p.status}
                </StatusBadge>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  {p.status !== "approved" && (
                    <form action={approvePurchase.bind(null, p.id)}>
                      <button className="text-xs uppercase tracking-wide text-emerald-400 hover:text-emerald-300">
                        Approve
                      </button>
                    </form>
                  )}
                  {p.status !== "rejected" && (
                    <form action={rejectPurchase.bind(null, p.id)}>
                      <button className="text-xs uppercase tracking-wide text-red-400 hover:text-red-300">
                        Reject
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
