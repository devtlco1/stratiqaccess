"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/email/activityLog";
import { normalizeEmail } from "@/lib/email/contactImport";
import type { ContactSource, ContactStatus } from "@/lib/email/dbTypes";

const STATUSES: ContactStatus[] = ["active", "unsubscribed", "bounced", "suppressed", "archived"];

function readForm(formData: FormData) {
  const status = String(formData.get("status") || "active");
  const tagsRaw = String(formData.get("tags") || "");

  return {
    name: String(formData.get("name") || "").trim(),
    company_name: String(formData.get("company_name") || "").trim() || null,
    email: String(formData.get("email") || "").trim(),
    phone: String(formData.get("phone") || "").trim() || null,
    country: String(formData.get("country") || "").trim() || null,
    city: String(formData.get("city") || "").trim() || null,
    sector: String(formData.get("sector") || "").trim() || null,
    job_title: String(formData.get("job_title") || "").trim() || null,
    website: String(formData.get("website") || "").trim() || null,
    language: String(formData.get("language") || "").trim() || null,
    notes: String(formData.get("notes") || "").trim() || null,
    tags: tagsRaw ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean) : [],
    status: (STATUSES.includes(status as ContactStatus) ? status : "active") as ContactStatus,
  };
}

export async function createContact(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const fields = readForm(formData);

  if (!fields.name || !fields.email) {
    throw new Error("Name and email are required.");
  }

  const { data, error } = await supabase
    .from("email_contacts")
    .insert({ ...fields, source: "manual" as ContactSource })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await logActivity(supabase, {
    actorType: "user",
    actorId: user?.id,
    action: "contact.created",
    entityType: "email_contact",
    entityId: data.id,
    metadata: { email: fields.email },
  });

  revalidatePath("/admin/email-center/contacts");
  redirect("/admin/email-center/contacts");
}

export async function updateContact(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const fields = readForm(formData);

  if (!fields.name || !fields.email) {
    throw new Error("Name and email are required.");
  }

  const { error } = await supabase.from("email_contacts").update(fields).eq("id", id);
  if (error) throw new Error(error.message);

  await logActivity(supabase, { actorType: "user", actorId: user?.id, action: "contact.updated", entityType: "email_contact", entityId: id });

  revalidatePath("/admin/email-center/contacts");
  redirect("/admin/email-center/contacts");
}

export async function archiveContact(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("email_contacts").update({ status: "archived" }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/email-center/contacts");
  redirect("/admin/email-center/contacts");
}

export async function deleteContact(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("email_contacts").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/email-center/contacts");
  redirect("/admin/email-center/contacts");
}

export async function bulkAddToList(formData: FormData) {
  const supabase = await createClient();
  const ids = formData.getAll("ids").map(String);
  const listId = String(formData.get("list_id") || "");
  if (!listId || ids.length === 0) return;

  const rows = ids.map((contact_id) => ({ list_id: listId, contact_id }));
  const { error } = await supabase.from("email_contact_list_members").upsert(rows, { onConflict: "list_id,contact_id" });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/email-center/contacts");
  revalidatePath("/admin/email-center/lists");
}

export async function bulkRemoveFromList(formData: FormData) {
  const supabase = await createClient();
  const ids = formData.getAll("ids").map(String);
  const listId = String(formData.get("list_id") || "");
  if (!listId || ids.length === 0) return;

  const { error } = await supabase.from("email_contact_list_members").delete().eq("list_id", listId).in("contact_id", ids);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/email-center/contacts");
  revalidatePath("/admin/email-center/lists");
}

export async function bulkSuppress(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ids = formData.getAll("ids").map(String);
  if (ids.length === 0) return;

  const { data: contacts } = await supabase.from("email_contacts").select("id, email").in("id", ids);
  for (const contact of contacts ?? []) {
    const emailNormalized = normalizeEmail(contact.email);
    await supabase
      .from("email_suppression_list")
      .upsert(
        {
          email_normalized: emailNormalized,
          original_email: contact.email,
          reason: "manual",
          source: "bulk_contact_action",
          is_active: true,
          created_by: user?.id ?? null,
          restored_at: null,
          restored_by: null,
        },
        { onConflict: "email_normalized" }
      );
  }

  await supabase.from("email_contacts").update({ status: "suppressed", is_subscribed: false }).in("id", ids);

  await logActivity(supabase, {
    actorType: "user",
    actorId: user?.id,
    action: "contact.bulk_suppressed",
    entityType: "email_contact",
    metadata: { count: ids.length },
  });

  revalidatePath("/admin/email-center/contacts");
  revalidatePath("/admin/email-center/suppression");
}

export async function bulkArchive(formData: FormData) {
  const supabase = await createClient();
  const ids = formData.getAll("ids").map(String);
  if (ids.length === 0) return;

  const { error } = await supabase.from("email_contacts").update({ status: "archived" }).in("id", ids);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/email-center/contacts");
}
