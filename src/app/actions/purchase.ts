"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPaymentProvider } from "@/lib/payments";

export type PurchaseState = { status: "idle" | "error" | "manual"; message?: string };

export async function purchaseReport(
  _prev: PurchaseState,
  formData: FormData,
): Promise<PurchaseState> {
  const reportId = String(formData.get("report_id") ?? "");
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/account/login?next=/reports`);
  }

  const { data: report } = await supabase.from("reports").select("*").eq("id", reportId).single();
  if (!report) return { status: "error", message: "Report not found." };

  const { data: purchase, error } = await supabase
    .from("purchases")
    .insert({
      user_id: user.id,
      item_type: "report",
      item_id: report.id,
      amount: report.price,
      currency: report.currency,
      payment_method: getPaymentProvider().id === "stripe" ? "stripe" : "manual",
    })
    .select()
    .single();

  if (error || !purchase) {
    return { status: "error", message: error?.message ?? "Could not start purchase." };
  }

  const provider = getPaymentProvider();
  const result = await provider.createCheckout({
    purchaseId: purchase.id,
    title: report.title,
    amount: Number(report.price),
    currency: report.currency,
    customerEmail: user.email,
    successUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/account`,
    cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/reports`,
  });

  if (result.mode === "redirect") {
    redirect(result.url);
  }

  return { status: "manual", message: result.instructions };
}
