"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/admin/require-staff";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { status: "idle" | "error"; message?: string };

export async function uploadMedia(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user } = await requireStaff();
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose a file to upload." };
  }

  const supabase = await createClient();
  const path = `${crypto.randomUUID()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from("public-media").upload(path, file);
  if (uploadError) return { status: "error", message: uploadError.message };

  const { error } = await supabase.from("media").insert({
    file_path: path,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    uploaded_by: user.id,
  });
  if (error) return { status: "error", message: error.message };

  revalidatePath("/admin/media");
  return { status: "idle" };
}

export async function deleteMedia(id: string, filePath: string) {
  await requireStaff();
  const supabase = await createClient();
  await supabase.storage.from("public-media").remove([filePath]);
  await supabase.from("media").delete().eq("id", id);
  revalidatePath("/admin/media");
}
