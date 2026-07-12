import { describe, it, expect, beforeAll } from "vitest";
import { createUnsubscribeToken, verifyUnsubscribeToken, buildUnsubscribeUrl } from "./unsubscribeToken";

beforeAll(() => {
  process.env.UNSUBSCRIBE_TOKEN_SECRET = "test-secret-for-unit-tests-only";
  process.env.NEXT_PUBLIC_SITE_URL = "https://stratiqaccess.com";
});

describe("unsubscribe token round trip", () => {
  it("verifies a token it just created and recovers the original contact id", () => {
    const token = createUnsubscribeToken("11111111-1111-1111-1111-111111111111");
    expect(verifyUnsubscribeToken(token)).toBe("11111111-1111-1111-1111-111111111111");
  });

  it("rejects a tampered signature", () => {
    const token = createUnsubscribeToken("11111111-1111-1111-1111-111111111111");
    const [encodedId] = token.split(".");
    const tampered = `${encodedId}.0000000000000000000000000000000000000000000000000000000000000000`;
    expect(verifyUnsubscribeToken(tampered)).toBeNull();
  });

  it("rejects a token for a different contact id spliced onto a valid signature", () => {
    const tokenA = createUnsubscribeToken("11111111-1111-1111-1111-111111111111");
    const tokenB = createUnsubscribeToken("22222222-2222-2222-2222-222222222222");
    const [, signatureA] = tokenA.split(".");
    const [encodedIdB] = tokenB.split(".");
    expect(verifyUnsubscribeToken(`${encodedIdB}.${signatureA}`)).toBeNull();
  });

  it("rejects a malformed token", () => {
    expect(verifyUnsubscribeToken("not-a-real-token")).toBeNull();
    expect(verifyUnsubscribeToken("")).toBeNull();
  });

  it("builds a full unsubscribe URL using the site URL", () => {
    const url = buildUnsubscribeUrl("11111111-1111-1111-1111-111111111111");
    expect(url).toMatch(/^https:\/\/stratiqaccess\.com\/unsubscribe\?token=/);
  });
});
