"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin/require-staff";
import { createClient } from "@/lib/supabase/server";
import type { LeadStatus, NdaStatus } from "@/lib/supabase/types";

export async function updateLeadStatus(id: string, status: LeadStatus) {
  await requireStaff();
  const supabase = await createClient();
  await supabase.from("leads").update({ status }).eq("id", id);
  revalidatePath("/admin/leads");
}

export async function updateNdaStatus(id: string, status: NdaStatus) {
  await requireStaff();
  const supabase = await createClient();
  await supabase.from("nda_requests").update({ status }).eq("id", id);
  revalidatePath("/admin/nda-requests");
}
