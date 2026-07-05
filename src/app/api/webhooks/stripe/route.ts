import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!secret || !stripeKey) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 501 });
  }

  const stripe = new Stripe(stripeKey);
  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const purchaseId = session.metadata?.purchaseId;

    if (purchaseId) {
      const supabase = await createClient();
      await supabase
        .from("purchases")
        .update({ status: "approved", approved_at: new Date().toISOString() })
        .eq("id", purchaseId);

      const { data: purchase } = await supabase
        .from("purchases")
        .select("*")
        .eq("id", purchaseId)
        .single();

      if (purchase?.item_type === "report") {
        const { data: report } = await supabase
          .from("reports")
          .select("file_path")
          .eq("id", purchase.item_id)
          .single();

        if (report?.file_path) {
          await supabase.from("downloads").insert({ purchase_id: purchaseId, file_path: report.file_path });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
