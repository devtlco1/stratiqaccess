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
  const imageUrl = await uploadImage(supabase, image, "case-studies");

  return {
    title: String(formData.get("title") || ""),
    sector: String(formData.get("sector") || ""),
    summary: String(formData.get("summary") || ""),
    body: parseBody(String(formData.get("body") || "")),
    titleAr: String(formData.get("titleAr") || "") || null,
    sectorAr: String(formData.get("sectorAr") || "") || null,
    summaryAr: String(formData.get("summaryAr") || "") || null,
    bodyAr: parseBody(String(formData.get("bodyAr") || "")),
    imageUrl,
  };
}

export async function createCaseStudy(formData: FormData) {
  const supabase = await createClient();
  const fields = await readForm(formData, supabase);
  const slug = slugify(String(formData.get("slug") || fields.title));

  const { error } = await supabase.from("case_studies").insert({
    slug,
    title: fields.title,
    sector: fields.sector,
    summary: fields.summary,
    body: fields.body,
    title_ar: fields.titleAr,
    sector_ar: fields.sectorAr,
    summary_ar: fields.summaryAr,
    body_ar: fields.bodyAr,
    image_url: fields.imageUrl,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/case-studies");
  revalidatePath("/ar/case-studies");
  revalidatePath("/");
  revalidatePath("/ar");
  redirect("/admin/case-studies");
}

export async function updateCaseStudy(id: string, formData: FormData) {
  const supabase = await createClient();
  const fields = await readForm(formData, supabase);
  const slug = slugify(String(formData.get("slug") || fields.title));

  const update: Record<string, unknown> = {
    slug,
    title: fields.title,
    sector: fields.sector,
    summary: fields.summary,
    body: fields.body,
    title_ar: fields.titleAr,
    sector_ar: fields.sectorAr,
    summary_ar: fields.summaryAr,
    body_ar: fields.bodyAr,
  };
  if (fields.imageUrl) update.image_url = fields.imageUrl;

  const { error } = await supabase.from("case_studies").update(update).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/case-studies");
  revalidatePath("/ar/case-studies");
  revalidatePath("/");
  revalidatePath("/ar");
  redirect("/admin/case-studies");
}

export async function deleteCaseStudy(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("case_studies").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/case-studies");
  revalidatePath("/ar/case-studies");
  revalidatePath("/");
  revalidatePath("/ar");
  redirect("/admin/case-studies");
}
