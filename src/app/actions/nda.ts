"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const ndaSchema = z.object({
  opportunity_id: z.string().uuid(),
  company_name: z.string().trim().min(1).max(200),
  email: z.string().trim().email(),
  message: z.string().trim().max(2000).optional(),
});

export type SubmitNdaState = { status: "idle" | "success" | "error"; message?: string };

export async function requestNdaAccess(
  _prevState: SubmitNdaState,
  formData: FormData,
): Promise<SubmitNdaState> {
  const parsed = ndaSchema.safeParse({
    opportunity_id: formData.get("opportunity_id"),
    company_name: formData.get("company_name"),
    email: formData.get("email"),
    message: formData.get("message") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: "Please check the form and try again." };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("nda_requests").insert({
      ...parsed.data,
      user_id: user?.id ?? null,
    });
    if (error) throw error;
    return { status: "success" };
  } catch {
    return { status: "error", message: "Something went wrong. Please try again." };
  }
}
