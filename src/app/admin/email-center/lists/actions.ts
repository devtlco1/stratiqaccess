"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createList(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  if (!name) throw new Error("List name is required.");

  const { error } = await supabase.from("email_contact_lists").insert({ name, description });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/email-center/lists");
  redirect("/admin/email-center/lists");
}

export async function updateList(id: string, formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  if (!name) throw new Error("List name is required.");

  const { error } = await supabase.from("email_contact_lists").update({ name, description }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/email-center/lists");
  redirect("/admin/email-center/lists");
}

export async function deleteList(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("email_contact_lists").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/email-center/lists");
  redirect("/admin/email-center/lists");
}

export async function removeMemberFromList(listId: string, contactId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("email_contact_list_members")
    .delete()
    .eq("list_id", listId)
    .eq("contact_id", contactId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/email-center/lists/${listId}`);
}
