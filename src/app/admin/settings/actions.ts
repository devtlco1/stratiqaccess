"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateSiteSettings(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .update({
      name: String(formData.get("name") || ""),
      tagline: String(formData.get("tagline") || ""),
      description: String(formData.get("description") || ""),
      email: String(formData.get("email") || ""),
      location: String(formData.get("location") || ""),
    })
    .eq("id", 1);

  if (error) throw new Error(error.message);

  revalidatePath("/", "layout");
}
