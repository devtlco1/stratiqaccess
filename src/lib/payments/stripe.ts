import Stripe from "stripe";
import type { CheckoutItem, CheckoutResult, PaymentProvider } from "./types";

let client: Stripe | null = null;

function getClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

/**
 * Wire up by setting STRIPE_SECRET_KEY and PAYMENT_PROVIDER=stripe in .env.
 * The webhook handler at src/app/api/webhooks/stripe/route.ts marks the
 * matching `purchases` row 'approved' on checkout.session.completed.
 */
export const stripeProvider: PaymentProvider = {
  id: "stripe",
  async createCheckout(item: CheckoutItem): Promise<CheckoutResult> {
    const stripe = getClient();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: item.customerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: item.currency.toLowerCase(),
            unit_amount: Math.round(item.amount * 100),
            product_data: { name: item.title },
          },
        },
      ],
      success_url: item.successUrl,
      cancel_url: item.cancelUrl,
      metadata: { purchaseId: item.purchaseId },
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return { mode: "redirect", url: session.url };
  },
};
