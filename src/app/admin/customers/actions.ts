"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CustomerStatus } from "@/lib/types";

const STATUSES: CustomerStatus[] = ["New", "Contacted", "Qualified", "In Progress", "Won", "Lost"];

function readForm(formData: FormData) {
  const status = String(formData.get("status") || "New");

  return {
    name: String(formData.get("name") || ""),
    company: String(formData.get("company") || "").trim() || null,
    email: String(formData.get("email") || "").trim() || null,
    phone: String(formData.get("phone") || "").trim() || null,
    source: String(formData.get("source") || "").trim() || null,
    status: (STATUSES.includes(status as CustomerStatus) ? status : "New") as CustomerStatus,
    notes: String(formData.get("notes") || "").trim() || null,
    source_message_id: String(formData.get("source_message_id") || "").trim() || null,
  };
}

export async function createCustomer(formData: FormData) {
  const supabase = await createClient();
  const fields = readForm(formData);

  const { error } = await supabase.from("customers").insert(fields);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient();
  const fields = readForm(formData);

  const { error } = await supabase.from("customers").update(fields).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/customers");
  redirect("/admin/customers");
}
