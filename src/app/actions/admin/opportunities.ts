"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaff } from "@/lib/admin/require-staff";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(["tender", "investment"]),
  title: z.string().trim().min(1).max(300),
  sector_id: z.string().uuid().optional().or(z.literal("")),
  buyer: z.string().trim().max(300).optional(),
  location: z.string().trim().max(200).optional(),
  country: z.string().trim().max(100).default("Iraq"),
  deadline: z.string().optional().or(z.literal("")),
  status: z.enum(["open", "closed", "under_review", "awarded"]).default("open"),
  tender_type: z.string().trim().max(200).optional(),
  reference_no: z.string().trim().max(100).optional(),
  ownership: z.enum(["government", "private"]).default("government"),
  procurement_type: z.enum(["tender", "contract", "purchase_request"]).default("tender"),
  published_at: z.string().optional().or(z.literal("")),
  summary: z.string().trim().min(1).max(2000),
  confidential_details: z.string().trim().max(20000).optional(),
  tags: z.string().optional(),
  price: z.coerce.number().optional(),
  is_free_preview: z.coerce.boolean().default(true),
  requires_nda: z.coerce.boolean().default(true),
  featured: z.coerce.boolean().default(false),
  content_status: z.enum(["draft", "published"]).default("draft"),
});

export type ActionState = { status: "idle" | "error"; message?: string };

export async function saveOpportunity(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();
  const parsed = schema.safeParse({
    id: formData.get("id") || undefined,
    kind: formData.get("kind"),
    title: formData.get("title"),
    sector_id: formData.get("sector_id") || "",
    buyer: formData.get("buyer") || undefined,
    location: formData.get("location") || undefined,
    country: formData.get("country") || "Iraq",
    deadline: formData.get("deadline") || "",
    status: formData.get("status") ?? "open",
    tender_type: formData.get("tender_type") || undefined,
    reference_no: formData.get("reference_no") || undefined,
    ownership: formData.get("ownership") ?? "government",
    procurement_type: formData.get("procurement_type") ?? "tender",
    published_at: formData.get("published_at") || "",
    summary: formData.get("summary"),
    confidential_details: formData.get("confidential_details") || undefined,
    tags: formData.get("tags") || undefined,
    price: formData.get("price") || undefined,
    is_free_preview: formData.get("is_free_preview") === "on",
    requires_nda: formData.get("requires_nda") === "on",
    featured: formData.get("featured") === "on",
    content_status: formData.get("content_status") ?? "draft",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { id, tags, sector_id, deadline, published_at, ...rest } = parsed.data;
  const values = {
    ...rest,
    sector_id: sector_id || null,
    deadline: deadline || null,
    ...(published_at ? { published_at } : {}),
    tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
  };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("opportunities").update(values).eq("id", id)
    : await supabase.from("opportunities").insert(values);

  if (error) return { status: "error", message: error.message };

  const path = parsed.data.kind === "tender" ? "/admin/tenders" : "/admin/opportunities";
  revalidatePath(path);
  redirect(path);
}

export async function deleteOpportunity(id: string, kind: "tender" | "investment") {
  await requireStaff();
  const supabase = await createClient();
  await supabase.from("opportunities").delete().eq("id", id);
  revalidatePath(kind === "tender" ? "/admin/tenders" : "/admin/opportunities");
}
