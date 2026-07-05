"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/admin/require-staff";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(300),
  excerpt: z.string().trim().max(500).optional(),
  body: z.string().trim().max(50000).optional(),
  sector_id: z.string().uuid().optional().or(z.literal("")),
  featured: z.coerce.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type ActionState = { status: "idle" | "error"; message?: string };

export async function saveArticle(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();
  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    slug: formData.get("slug"),
    title: formData.get("title"),
    excerpt: formData.get("excerpt") || undefined,
    body: formData.get("body") || undefined,
    sector_id: formData.get("sector_id") || "",
    featured: formData.get("featured") === "on",
    status: formData.get("status") ?? "draft",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { id, sector_id, status, ...rest } = parsed.data;
  const values = {
    ...rest,
    status,
    sector_id: sector_id || null,
    published_at: status === "published" ? new Date().toISOString() : null,
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("articles").update(values).eq("id", id)
    : await supabase.from("articles").insert(values);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/admin/insights");
  redirect("/admin/insights");
}

export async function deleteArticle(id: string) {
  await requireStaff();
  const supabase = await createClient();
  await supabase.from("articles").delete().eq("id", id);
  revalidatePath("/admin/insights");
}
