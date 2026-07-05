"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { LeadFormType } from "@/lib/supabase/types";

const leadSchema = z.object({
  form_type: z
    .enum(["general", "market_entry", "representation", "partnership", "tender_intelligence"])
    .default("general"),
  company_name: z.string().trim().min(1).max(200).optional(),
  contact_person: z.string().trim().min(1).max(200).optional(),
  email: z.string().trim().email(),
  country: z.string().trim().max(100).optional(),
  sector: z.string().trim().max(100).optional(),
  service_interest: z.string().trim().max(200).optional(),
  message: z.string().trim().max(5000).optional(),
});

export type SubmitLeadState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function submitLead(
  _prevState: SubmitLeadState,
  formData: FormData,
): Promise<SubmitLeadState> {
  const parsed = leadSchema.safeParse({
    form_type: (formData.get("form_type") as LeadFormType) ?? "general",
    company_name: formData.get("company_name") || undefined,
    contact_person: formData.get("contact_person") || undefined,
    email: formData.get("email"),
    country: formData.get("country") || undefined,
    sector: formData.get("sector") || undefined,
    service_interest: formData.get("service_interest") || undefined,
    message: formData.get("message") || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: "Please check the form and try again." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("leads").insert(parsed.data);
    if (error) throw error;
    return { status: "success" };
  } catch {
    return {
      status: "error",
      message: "Something went wrong while submitting your inquiry. Please try again.",
    };
  }
}
