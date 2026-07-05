"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin/require-staff";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/supabase/types";

export async function updateUserRole(id: string, role: UserRole) {
  const { profile } = await requireStaff();
  if (profile.role !== "admin") return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/admin/users");
}
