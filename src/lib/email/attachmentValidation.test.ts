import { describe, it, expect } from "vitest";
import { validateAttachmentFile, formatBytes, getExtension } from "./attachmentValidation";

describe("getExtension", () => {
  it("extracts the lowercased extension", () => {
    expect(getExtension("Invoice.PDF")).toBe("pdf");
    expect(getExtension("archive.tar.gz")).toBe("gz");
  });
  it("returns empty string for no extension", () => {
    expect(getExtension("README")).toBe("");
  });
});

describe("validateAttachmentFile", () => {
  it("accepts an allowed document type within the size limit", () => {
    const result = validateAttachmentFile({ name: "profile.pdf", type: "application/pdf", size: 1_000_000 }, 25);
    expect(result.valid).toBe(true);
  });

  it("rejects dangerous executable extensions", () => {
    const result = validateAttachmentFile({ name: "installer.exe", type: "application/x-msdownload", size: 1000 }, 25);
    expect(result.valid).toBe(false);
  });

  it("rejects scripts disguised with an image MIME type but wrong extension", () => {
    const result = validateAttachmentFile({ name: "payload.js", type: "image/png", size: 1000 }, 25);
    expect(result.valid).toBe(false);
  });

  it("rejects a mismatched MIME type even for an allowed extension", () => {
    const result = validateAttachmentFile({ name: "file.pdf", type: "application/x-msdownload", size: 1000 }, 25);
    expect(result.valid).toBe(false);
  });

  it("rejects files over the configured size limit", () => {
    const result = validateAttachmentFile({ name: "big.pdf", type: "application/pdf", size: 30 * 1024 * 1024 }, 25);
    expect(result.valid).toBe(false);
    expect(result.reason).toMatch(/25MB/);
  });
});

describe("formatBytes", () => {
  it("formats sizes with the right unit", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(500)).toBe("500 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5.0 MB");
  });
});
