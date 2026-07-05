"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin/require-staff";
import { createClient } from "@/lib/supabase/server";

export async function toggleLanguageActive(code: string, isActive: boolean) {
  await requireStaff();
  const supabase = await createClient();
  await supabase.from("languages").update({ is_active: isActive }).eq("code", code);
  revalidatePath("/admin/languages");
}
