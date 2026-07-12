import { describe, it, expect } from "vitest";
import { isValidEmail, normalizeEmail, categorizeImportRows, summarizeImportResults, type ImportFieldMapping } from "./contactImport";

describe("isValidEmail", () => {
  it("accepts well-formed addresses", () => {
    expect(isValidEmail("jane@example.com")).toBe(true);
    expect(isValidEmail("  jane@example.com  ")).toBe(true);
  });
  it("rejects malformed addresses", () => {
    expect(isValidEmail("not-an-email")).toBe(false);
    expect(isValidEmail("missing@domain")).toBe(false);
    expect(isValidEmail("@example.com")).toBe(false);
    expect(isValidEmail("")).toBe(false);
  });
});

describe("normalizeEmail", () => {
  it("lowercases and trims", () => {
    expect(normalizeEmail("  Jane@Example.COM  ")).toBe("jane@example.com");
  });
});

const MAPPING: ImportFieldMapping = { name: "Name", email: "Email", company_name: "Company" };

describe("categorizeImportRows — dedup and validation", () => {
  it("marks a row with no existing DB match as 'add'", () => {
    const results = categorizeImportRows([{ Name: "Jane Doe", Email: "jane@example.com", Company: "Acme" }], MAPPING, new Map());
    expect(results[0].outcome).toBe("add");
    expect(results[0].parsed?.email).toBe("jane@example.com");
  });

  it("marks a row matching an existing contact as 'update'", () => {
    const existing = new Map([["jane@example.com", "contact-id-123"]]);
    const results = categorizeImportRows([{ Name: "Jane Doe", Email: "Jane@Example.com" }], MAPPING, existing);
    expect(results[0].outcome).toBe("update");
    expect(results[0].existingContactId).toBe("contact-id-123");
  });

  it("detects duplicate emails within the same import file", () => {
    const rows = [
      { Name: "Jane", Email: "jane@example.com" },
      { Name: "Jane Again", Email: "JANE@EXAMPLE.COM" },
    ];
    const results = categorizeImportRows(rows, MAPPING, new Map());
    expect(results[0].outcome).toBe("add");
    expect(results[1].outcome).toBe("skip_duplicate_in_file");
  });

  it("rejects invalid email addresses", () => {
    const results = categorizeImportRows([{ Name: "Bad", Email: "not-an-email" }], MAPPING, new Map());
    expect(results[0].outcome).toBe("reject_invalid_email");
  });

  it("rejects rows with no email at all", () => {
    const results = categorizeImportRows([{ Name: "No Email" }], MAPPING, new Map());
    expect(results[0].outcome).toBe("reject_missing_email");
  });

  it("prevents accidental duplicate imports across repeated runs (same input -> same categorization)", () => {
    const rows = [{ Name: "Jane", Email: "jane@example.com" }];
    const firstRun = categorizeImportRows(rows, MAPPING, new Map());
    const secondRun = categorizeImportRows(rows, MAPPING, new Map([["jane@example.com", "id-1"]]));
    expect(firstRun[0].outcome).toBe("add");
    expect(secondRun[0].outcome).toBe("update"); // re-running against existing data updates rather than duplicates
  });
});

describe("summarizeImportResults", () => {
  it("counts every outcome bucket correctly", () => {
    const results = categorizeImportRows(
      [
        { Name: "A", Email: "a@example.com" },
        { Name: "B", Email: "a@example.com" }, // duplicate in file
        { Name: "C", Email: "not-valid" }, // invalid
        { Name: "D" }, // missing email
      ],
      MAPPING,
      new Map()
    );
    const summary = summarizeImportResults(results);
    expect(summary).toEqual({ total: 4, toAdd: 1, toUpdate: 0, duplicatesInFile: 1, invalidEmails: 1, missingEmails: 1 });
  });
});
