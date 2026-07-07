"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { uploadImage, parseBody } from "@/lib/admin/uploadImage";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function readForm(formData: FormData, supabase: Awaited<ReturnType<typeof createClient>>) {
  const image = formData.get("image") as File | null;
  const imageUrl = await uploadImage(supabase, image, "insights");

  return {
    title: String(formData.get("title") || ""),
    excerpt: String(formData.get("excerpt") || ""),
    publishedDate: String(formData.get("publishedDate") || new Date().toISOString().slice(0, 10)),
    body: parseBody(String(formData.get("body") || "")),
    imageUrl,
  };
}

export async function createInsight(formData: FormData) {
  const supabase = await createClient();
  const fields = await readForm(formData, supabase);
  const slug = slugify(String(formData.get("slug") || fields.title));

  const { error } = await supabase.from("insights").insert({
    slug,
    title: fields.title,
    excerpt: fields.excerpt,
    published_date: fields.publishedDate,
    body: fields.body,
    image_url: fields.imageUrl,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/insights");
  revalidatePath("/");
  redirect("/admin/insights");
}

export async function updateInsight(id: string, formData: FormData) {
  const supabase = await createClient();
  const fields = await readForm(formData, supabase);
  const slug = slugify(String(formData.get("slug") || fields.title));

  const update: Record<string, unknown> = {
    slug,
    title: fields.title,
    excerpt: fields.excerpt,
    published_date: fields.publishedDate,
    body: fields.body,
  };
  if (fields.imageUrl) update.image_url = fields.imageUrl;

  const { error } = await supabase.from("insights").update(update).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/insights");
  revalidatePath("/");
  redirect("/admin/insights");
}

export async function deleteInsight(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("insights").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/insights");
  revalidatePath("/");
  redirect("/admin/insights");
}
