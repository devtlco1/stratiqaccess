import type { PaymentProvider } from "./types";
import { manualProvider } from "./manual";
import { stripeProvider } from "./stripe";

const providers: Record<string, PaymentProvider> = {
  manual: manualProvider,
  stripe: stripeProvider,
  // bank_transfer, fastpay, zaincash: add a provider module and register it
  // here once each gateway/process is defined — same interface, no call-site
  // changes required.
};

export function getPaymentProvider(): PaymentProvider {
  const configured = process.env.PAYMENT_PROVIDER ?? "manual";
  return providers[configured] ?? manualProvider;
}

export * from "./types";
