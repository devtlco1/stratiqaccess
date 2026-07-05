import type { CheckoutItem, CheckoutResult, PaymentProvider } from "./types";

/**
 * Default provider until a live payment gateway is configured. Records the
 * purchase as 'pending' — an admin approves it manually from
 * /admin/purchases, which unlocks the download.
 */
export const manualProvider: PaymentProvider = {
  id: "manual",
  async createCheckout(item: CheckoutItem): Promise<CheckoutResult> {
    return {
      mode: "manual",
      instructions: `Your request for "${item.title}" (${item.currency} ${item.amount.toFixed(2)}) has been recorded. Our team will contact you with payment instructions (bank transfer, FastPay, or ZainCash) and grant access once payment is confirmed.`,
    };
  },
};
