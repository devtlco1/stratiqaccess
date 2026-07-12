import { describe, it, expect } from "vitest";
import { normalizeSubject } from "./threadMatching";

describe("normalizeSubject — thread grouping heuristic", () => {
  it("strips a single Re: prefix", () => {
    expect(normalizeSubject("Re: Partnership Inquiry")).toBe("partnership inquiry");
  });

  it("strips repeated and mixed-case Re:/Fwd: prefixes", () => {
    expect(normalizeSubject("RE: Fwd: re: Partnership Inquiry")).toBe("partnership inquiry");
  });

  it("strips Fw: (three-letter variant)", () => {
    expect(normalizeSubject("Fw: Quarterly Report")).toBe("quarterly report");
  });

  it("collapses whitespace and lowercases", () => {
    expect(normalizeSubject("  Hello   World  ")).toBe("hello world");
  });

  it("treats a missing subject as a stable placeholder, not an empty string", () => {
    expect(normalizeSubject(null)).toBe("(no subject)");
    expect(normalizeSubject("")).toBe("(no subject)");
  });

  it("does not strip Re: from the middle of a subject", () => {
    expect(normalizeSubject("Update Re: your account")).toBe("update re: your account");
  });
});
