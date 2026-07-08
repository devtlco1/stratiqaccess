"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadImage } from "@/lib/admin/uploadImage";

async function readForm(formData: FormData, supabase: Awaited<ReturnType<typeof createClient>>) {
  const logoFile = formData.get("logo") as File | null;
  const uploadedLogoUrl = await uploadImage(supabase, logoFile, "clients");
  const manualLogoUrl = String(formData.get("logo_url") || "").trim();

  return {
    name: String(formData.get("name") || ""),
    website_url: String(formData.get("website_url") || "").trim() || null,
    industry: String(formData.get("industry") || "").trim() || null,
    is_featured: formData.get("is_featured") === "on",
    is_published: formData.get("is_published") === "on",
    display_order: Number(formData.get("display_order") || 0),
    logo_url: uploadedLogoUrl || manualLogoUrl || null,
  };
}

export async function createClientRow(formData: FormData) {
  const supabase = await createClient();
  const fields = await readForm(formData, supabase);

  const { error } = await supabase.from("clients").insert(fields);
  if (error) throw new Error(error.message);

  revalidatePath("/clients");
  revalidatePath("/ar/clients");
  revalidatePath("/");
  revalidatePath("/ar");
  redirect("/admin/clients");
}

export async function updateClientRow(id: string, formData: FormData) {
  const supabase = await createClient();
  const fields = await readForm(formData, supabase);

  const { error } = await supabase.from("clients").update(fields).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/clients");
  revalidatePath("/ar/clients");
  revalidatePath("/");
  revalidatePath("/ar");
  redirect("/admin/clients");
}

export async function deleteClientRow(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/clients");
  revalidatePath("/ar/clients");
  revalidatePath("/");
  revalidatePath("/ar");
  redirect("/admin/clients");
}
