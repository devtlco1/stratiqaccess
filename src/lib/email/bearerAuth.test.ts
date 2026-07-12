import { describe, it, expect } from "vitest";
import { verifyBearerToken } from "./bearerAuth";

describe("verifyBearerToken — webhook/cron authentication", () => {
  it("accepts a correctly formatted matching bearer token", () => {
    expect(verifyBearerToken("Bearer super-secret-value", "super-secret-value")).toBe(true);
  });

  it("rejects a mismatched token", () => {
    expect(verifyBearerToken("Bearer wrong-value", "super-secret-value")).toBe(false);
  });

  it("rejects when the Authorization header is missing", () => {
    expect(verifyBearerToken(null, "super-secret-value")).toBe(false);
  });

  it("rejects a header without the Bearer prefix", () => {
    expect(verifyBearerToken("super-secret-value", "super-secret-value")).toBe(false);
  });

  it("rejects when no secret is configured server-side (fails closed, not open)", () => {
    expect(verifyBearerToken("Bearer anything", undefined)).toBe(false);
  });

  it("rejects tokens of different lengths without throwing", () => {
    expect(verifyBearerToken("Bearer short", "a-much-longer-secret-value")).toBe(false);
  });

  it("is not fooled by a token that is a prefix of the real secret", () => {
    expect(verifyBearerToken("Bearer super-secret", "super-secret-value")).toBe(false);
  });
});
