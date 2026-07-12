import { describe, it, expect } from "vitest";
import { renderTemplate, renderEmail, extractVariables, firstNameOf, buildVariableContext } from "./templateVariables";

describe("firstNameOf", () => {
  it("takes the first token of a full name", () => {
    expect(firstNameOf("Michael Smith")).toBe("Michael");
  });
  it("handles a single-word name", () => {
    expect(firstNameOf("Michael")).toBe("Michael");
  });
  it("handles empty/missing names", () => {
    expect(firstNameOf("")).toBe("");
    expect(firstNameOf(null)).toBe("");
    expect(firstNameOf(undefined)).toBe("");
  });
});

describe("extractVariables", () => {
  it("finds every {{variable}} token in a string", () => {
    expect(extractVariables("Dear {{name}}, welcome to {{company}}.")).toEqual(["name", "company"]);
  });
  it("dedupes repeated variables", () => {
    expect(extractVariables("{{name}} {{name}} {{email}}")).toEqual(["name", "email"]);
  });
  it("returns an empty array when there are no variables", () => {
    expect(extractVariables("Dear customer,")).toEqual([]);
  });
});

describe("renderTemplate — per-recipient personalization", () => {
  it("replaces {{name}} separately for every recipient (the core requirement)", () => {
    const template = "Dear {{name}},";
    const michael = renderTemplate(template, { name: "Michael Smith" });
    const jane = renderTemplate(template, { name: "Jane Doe" });

    expect(michael.rendered).toBe("Dear Michael Smith,");
    expect(jane.rendered).toBe("Dear Jane Doe,");
    expect(michael.rendered).not.toBe(jane.rendered);
  });

  it("reports a missing variable when the contact has no value and no fallback is configured", () => {
    const result = renderTemplate("Dear {{name}},", { name: "" });
    expect(result.missingVariables).toEqual(["name"]);
    // Unresolved placeholder must remain literally in the output, never silently dropped.
    expect(result.rendered).toBe("Dear {{name}},");
  });

  it("does not send unresolved placeholders — missingVariables must block sending", () => {
    const result = renderTemplate("Dear {{name}}, from {{sender_name}}", { name: "Michael" });
    expect(result.missingVariables).toContain("sender_name");
    expect(result.rendered).toContain("{{sender_name}}");
  });

  it("uses a fallback only when explicitly configured, and reports it as used (not silent)", () => {
    const result = renderTemplate("Dear {{name}},", { name: "" }, { fallbacks: { name: "Sir/Madam" } });
    expect(result.rendered).toBe("Dear Sir/Madam,");
    expect(result.missingVariables).toEqual([]);
    expect(result.fallbacksUsed).toEqual(["name"]);
  });

  it("flags unsupported variable names as missing rather than silently leaving them", () => {
    const result = renderTemplate("Hello {{not_a_real_variable}}", {});
    expect(result.missingVariables).toEqual(["not_a_real_variable"]);
  });
});

describe("renderEmail — subject + body combined", () => {
  it("merges missing variables from subject and body", () => {
    const result = renderEmail(
      { subject: "Hi {{first_name}}", html: "<p>Dear {{name}}, visit {{website}}</p>" },
      { first_name: "Michael", name: "Michael Smith" }
    );
    expect(result.subject).toBe("Hi Michael");
    expect(result.html).toContain("Dear Michael Smith");
    expect(result.missingVariables).toEqual(["website"]);
  });
});

describe("buildVariableContext", () => {
  it("derives first_name from name automatically", () => {
    const context = buildVariableContext(
      { name: "Michael Smith", email: "michael@example.com" },
      "STRATIQ Access",
      "https://example.com/unsubscribe?token=x"
    );
    expect(context.first_name).toBe("Michael");
    expect(context.sender_name).toBe("STRATIQ Access");
  });
});
