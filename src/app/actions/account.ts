"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AccountAuthState = { status: "idle" | "error"; message?: string };

export async function accountSignIn(
  _prev: AccountAuthState,
  formData: FormData,
): Promise<AccountAuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/account");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { status: "error", message: "Invalid email or password." };
  redirect(next);
}

export async function accountSignUp(
  _prev: AccountAuthState,
  formData: FormData,
): Promise<AccountAuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) return { status: "error", message: error.message };
  redirect("/account");
}

export async function accountSignOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
