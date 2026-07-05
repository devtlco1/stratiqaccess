"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin/require-staff";
import { createClient } from "@/lib/supabase/server";

export async function approvePurchase(id: string) {
  const { user } = await requireStaff();
  const supabase = await createClient();

  const { data: purchase } = await supabase.from("purchases").select("*").eq("id", id).single();
  if (!purchase) return;

  await supabase
    .from("purchases")
    .update({ status: "approved", approved_by: user.id, approved_at: new Date().toISOString() })
    .eq("id", id);

  if (purchase.item_type === "report") {
    const { data: report } = await supabase
      .from("reports")
      .select("file_path")
      .eq("id", purchase.item_id)
      .single();

    if (report?.file_path) {
      await supabase.from("downloads").insert({ purchase_id: id, file_path: report.file_path });
    }
  }

  revalidatePath("/admin/purchases");
}

export async function rejectPurchase(id: string) {
  await requireStaff();
  const supabase = await createClient();
  await supabase.from("purchases").update({ status: "rejected" }).eq("id", id);
  revalidatePath("/admin/purchases");
}
