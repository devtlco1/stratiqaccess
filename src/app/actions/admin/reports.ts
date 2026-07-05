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
  description: z.string().trim().max(2000).optional(),
  price: z.coerce.number().min(0).default(0),
  currency: z.string().trim().default("USD"),
  featured: z.coerce.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
});

export type ActionState = { status: "idle" | "error"; message?: string };

export async function saveReport(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();
  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    slug: formData.get("slug"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    price: formData.get("price") || 0,
    currency: formData.get("currency") || "USD",
    featured: formData.get("featured") === "on",
    status: formData.get("status") ?? "draft",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { id, ...values } = parsed.data;
  let file_path: string | undefined;

  const file = formData.get("file");
  if (file instanceof File && file.size > 0) {
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("reports").upload(path, file);
    if (uploadError) return { status: "error", message: uploadError.message };
    file_path = path;
  }

  const payload = file_path ? { ...values, file_path } : values;

  const { error } = id
    ? await supabase.from("reports").update(payload).eq("id", id)
    : await supabase.from("reports").insert(payload);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/admin/reports");
  redirect("/admin/reports");
}

export async function deleteReport(id: string) {
  await requireStaff();
  const supabase = await createClient();
  await supabase.from("reports").delete().eq("id", id);
  revalidatePath("/admin/reports");
}
