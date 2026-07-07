"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadImage, parseBody, parseHighlights } from "@/lib/admin/uploadImage";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function readForm(formData: FormData, supabase: Awaited<ReturnType<typeof createClient>>) {
  const image = formData.get("image") as File | null;
  const imageUrl = await uploadImage(supabase, image, "services");

  return {
    title: String(formData.get("title") || ""),
    icon: String(formData.get("icon") || "compass"),
    description: String(formData.get("description") || ""),
    body: parseBody(String(formData.get("body") || "")),
    highlights: parseHighlights(String(formData.get("highlights") || "")),
    imageUrl,
  };
}

export async function createService(formData: FormData) {
  const supabase = await createClient();
  const fields = await readForm(formData, supabase);
  const slug = slugify(String(formData.get("slug") || fields.title));

  const { error } = await supabase.from("services").insert({
    slug,
    title: fields.title,
    icon: fields.icon,
    description: fields.description,
    body: fields.body,
    highlights: fields.highlights,
    image_url: fields.imageUrl,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/services");
  revalidatePath("/");
  redirect("/admin/services");
}

export async function updateService(id: string, formData: FormData) {
  const supabase = await createClient();
  const fields = await readForm(formData, supabase);
  const slug = slugify(String(formData.get("slug") || fields.title));

  const update: Record<string, unknown> = {
    slug,
    title: fields.title,
    icon: fields.icon,
    description: fields.description,
    body: fields.body,
    highlights: fields.highlights,
  };
  if (fields.imageUrl) update.image_url = fields.imageUrl;

  const { error } = await supabase.from("services").update(update).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/services");
  revalidatePath(`/services/${slug}`);
  revalidatePath("/");
  redirect("/admin/services");
}

export async function deleteService(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/services");
  revalidatePath("/");
  redirect("/admin/services");
}
