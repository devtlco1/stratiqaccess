export type CheckoutItem = {
  purchaseId: string;
  title: string;
  amount: number;
  currency: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
};

export type CheckoutResult =
  | { mode: "redirect"; url: string }
  | { mode: "manual"; instructions: string };

/**
 * Every payment method — Stripe today, bank transfer / FastPay / ZainCash /
 * manual invoice later — implements this shape so the checkout call site
 * never branches on provider.
 */
export interface PaymentProvider {
  id: "stripe" | "bank_transfer" | "fastpay" | "zaincash" | "manual";
  createCheckout(item: CheckoutItem): Promise<CheckoutResult>;
}
