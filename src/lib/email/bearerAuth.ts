import { timingSafeEqual } from "crypto";

// Shared timing-safe "Authorization: Bearer <secret>" check for the webhook
// and cron route handlers. Returns false (never throws) on any mismatch,
// including length differences — never logs the received or expected value.
export function verifyBearerToken(authorizationHeader: string | null, expectedSecret: string | undefined): boolean {
  if (!expectedSecret) return false;
  if (!authorizationHeader?.startsWith("Bearer ")) return false;

  const provided = authorizationHeader.slice("Bearer ".length).trim();
  const providedBuf = Buffer.from(provided, "utf8");
  const expectedBuf = Buffer.from(expectedSecret, "utf8");

  if (providedBuf.length !== expectedBuf.length) return false;
  return timingSafeEqual(providedBuf, expectedBuf);
}
