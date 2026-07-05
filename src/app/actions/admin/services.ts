"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/admin/require-staff";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().min(1).max(2000),
  body: z.string().trim().max(20000).optional(),
  sort_order: z.coerce.number().int().default(0),
  featured: z.coerce.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type ActionState = { status: "idle" | "error"; message?: string };

export async function saveService(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();
  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    slug: formData.get("slug"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    body: formData.get("body") || undefined,
    sort_order: formData.get("sort_order") || 0,
    featured: formData.get("featured") === "on",
    status: formData.get("status") ?? "draft",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { id, ...values } = parsed.data;
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("services").update(values).eq("id", id)
    : await supabase.from("services").insert(values);

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/services");
  redirect("/admin/services");
}

export async function deleteService(id: string) {
  await requireStaff();
  const supabase = await createClient();
  await supabase.from("services").delete().eq("id", id);
  revalidatePath("/admin/services");
}
