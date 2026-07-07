"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadImage } from "@/lib/admin/uploadImage";

export async function updateSiteImage(key: string, formData: FormData) {
  const supabase = await createClient();
  const image = formData.get("image") as File | null;
  const imageUrl = await uploadImage(supabase, image, "site");

  if (!imageUrl) return; // no file selected — nothing to update

  const { error } = await supabase.from("site_images").update({ image_url: imageUrl }).eq("key", key);
  if (error) throw new Error(error.message);

  // Every page that reads a managed site image could be affected — revalidate broadly.
  revalidatePath("/", "layout");
  revalidatePath("/admin/site-images");
}
