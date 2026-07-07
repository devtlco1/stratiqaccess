"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markMessageRead(id: string, isRead: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("messages").update({ is_read: isRead }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/messages");
}

export async function deleteMessage(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("messages").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/messages");
}
