"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaff } from "@/lib/admin/require-staff";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  site_name: z.string().trim().min(1),
  tagline: z.string().trim().min(1),
  legal_footer: z.string().trim().min(1),
  legal_footer_extended: z.string().trim().optional(),
  disclosure_notice: z.string().trim().min(1),
  contact_email: z.string().trim().email(),
});

export type ActionState = { status: "idle" | "error" | "success"; message?: string };

export async function saveSiteSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireStaff();
  const parsed = schema.safeParse({
    site_name: formData.get("site_name"),
    tagline: formData.get("tagline"),
    legal_footer: formData.get("legal_footer"),
    legal_footer_extended: formData.get("legal_footer_extended") || undefined,
    disclosure_notice: formData.get("disclosure_notice"),
    contact_email: formData.get("contact_email"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").update(parsed.data).eq("id", 1);

  if (error) return { status: "error", message: error.message };

  revalidatePath("/admin/settings");
  return { status: "success" };
}
