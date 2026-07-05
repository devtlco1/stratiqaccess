"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/admin/require-staff";
import { createClient } from "@/lib/supabase/server";

const pageSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(300),
  seo_title: z.string().trim().max(300).optional(),
  seo_description: z.string().trim().max(500).optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type ActionState = { status: "idle" | "error" | "success"; message?: string };

export async function savePageMeta(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();
  const parsed = pageSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    seo_title: formData.get("seo_title") || undefined,
    seo_description: formData.get("seo_description") || undefined,
    status: formData.get("status") ?? "draft",
  });

  if (!parsed.success) return { status: "error", message: "Invalid input." };

  const { id, ...values } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("pages").update(values).eq("id", id);
  if (error) return { status: "error", message: error.message };

  revalidatePath(`/admin/pages/${id}`);
  return { status: "success" };
}

const sectionSchema = z.object({
  id: z.string().uuid().optional(),
  page_id: z.string().uuid(),
  key: z.string().trim().min(1).max(100),
  heading: z.string().trim().max(300).optional(),
  body: z.string().trim().max(20000).optional(),
  sort_order: z.coerce.number().int().default(0),
  is_hidden: z.coerce.boolean().default(false),
});

export async function saveSection(formData: FormData) {
  await requireStaff();
  const parsed = sectionSchema.safeParse({
    id: formData.get("id") || undefined,
    page_id: formData.get("page_id"),
    key: formData.get("key"),
    heading: formData.get("heading") || undefined,
    body: formData.get("body") || undefined,
    sort_order: formData.get("sort_order") || 0,
    is_hidden: formData.get("is_hidden") === "on",
  });

  if (!parsed.success) return;

  const { id, page_id, ...values } = parsed.data;
  const supabase = await createClient();
  if (id) {
    await supabase.from("page_sections").update(values).eq("id", id);
  } else {
    await supabase.from("page_sections").insert({ page_id, ...values });
  }
  revalidatePath(`/admin/pages/${page_id}`);
}

export async function deleteSection(id: string, pageId: string) {
  await requireStaff();
  const supabase = await createClient();
  await supabase.from("page_sections").delete().eq("id", id);
  revalidatePath(`/admin/pages/${pageId}`);
}
