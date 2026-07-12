import { createHmac, timingSafeEqual } from "crypto";

// Signed, opaque one-click unsubscribe tokens: base64url(contactId) + "." +
// hex(HMAC-SHA256(contactId, UNSUBSCRIBE_TOKEN_SECRET)). No login required
// to unsubscribe (that's the whole point of the link), so this HMAC is what
// stands in for authorization — a raw contact id in the URL would let
// anyone enumerate/unsubscribe arbitrary contacts.

function getSecret(): string {
  const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET;
  if (!secret) {
    throw new Error("UNSUBSCRIBE_TOKEN_SECRET is not configured — required to generate/verify unsubscribe links.");
  }
  return secret;
}

function sign(contactId: string, secret: string): string {
  return createHmac("sha256", secret).update(contactId).digest("hex");
}

export function createUnsubscribeToken(contactId: string): string {
  const secret = getSecret();
  const encodedId = Buffer.from(contactId, "utf8").toString("base64url");
  const signature = sign(contactId, secret);
  return `${encodedId}.${signature}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  const secret = getSecret();
  const [encodedId, signature] = token.split(".");
  if (!encodedId || !signature) return null;

  let contactId: string;
  try {
    contactId = Buffer.from(encodedId, "base64url").toString("utf8");
  } catch {
    return null;
  }

  const expected = sign(contactId, secret);
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== actualBuf.length) return null;
  if (!timingSafeEqual(expectedBuf, actualBuf)) return null;

  return contactId;
}

export function buildUnsubscribeUrl(contactId: string): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const token = createUnsubscribeToken(contactId);
  return `${siteUrl}/unsubscribe?token=${encodeURIComponent(token)}`;
}
