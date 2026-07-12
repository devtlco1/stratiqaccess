// Allowlist-based (safer default than a blocklist) file validation for the
// Email Center attachment library. Hostinger does not document a message or
// attachment size limit anywhere in their API spec, so DEFAULT_ATTACHMENT_LIMIT_MB
// is an app-chosen conservative safety threshold (25MB, per product decision),
// not a documented Hostinger fact — it's admin-configurable in Settings and
// always labeled as such in the UI, never presented as an official limit.

export const DEFAULT_ATTACHMENT_LIMIT_MB = 25;

const ALLOWED_EXTENSIONS = new Set([
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "csv", "txt", "rtf",
  "jpg", "jpeg", "png", "gif", "webp",
]);

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/csv",
  "text/plain",
  "application/rtf",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

export function getExtension(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

export interface AttachmentValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateAttachmentFile(file: { name: string; type: string; size: number }, maxSizeMb = DEFAULT_ATTACHMENT_LIMIT_MB): AttachmentValidationResult {
  const extension = getExtension(file.name);
  if (!extension || !ALLOWED_EXTENSIONS.has(extension)) {
    return { valid: false, reason: `".${extension || "?"}" files are not allowed. Allowed types: ${Array.from(ALLOWED_EXTENSIONS).join(", ")}.` };
  }
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, reason: `MIME type "${file.type}" is not allowed for attachments.` };
  }
  if (file.size > maxSizeMb * 1024 * 1024) {
    return { valid: false, reason: `File is larger than the configured ${maxSizeMb}MB limit.` };
  }
  return { valid: true };
}

export function formatBytes(bytes: number | null | undefined): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
