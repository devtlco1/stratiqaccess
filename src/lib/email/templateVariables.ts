// Personalization for Email Center templates/campaigns. Variables use
// {{name}} syntax and are replaced independently per recipient — this module
// has no knowledge of "the campaign," just one contact's data at a time.

export const SUPPORTED_VARIABLES = [
  "name",
  "first_name",
  "company",
  "email",
  "job_title",
  "sector",
  "country",
  "website",
  "sender_name",
  "unsubscribe_url",
] as const;

export type TemplateVariable = (typeof SUPPORTED_VARIABLES)[number];

export type VariableContext = Partial<Record<TemplateVariable, string | null | undefined>>;

const VARIABLE_PATTERN = /\{\{\s*([a-zA-Z_]+)\s*\}\}/g;

export function firstNameOf(fullName: string | null | undefined): string {
  if (!fullName) return "";
  return fullName.trim().split(/\s+/)[0] ?? "";
}

export interface RenderOptions {
  // Fallback text used when a supported variable has no value for this
  // contact (e.g. missing job_title). Only applied when explicitly
  // configured — per the requirement that we never silently invent content.
  // A variable with no value AND no fallback is reported as "missing" and
  // must block sending.
  fallbacks?: Partial<Record<TemplateVariable, string>>;
}

export interface RenderResult {
  rendered: string;
  // Variables present in the template text that could not be resolved:
  // either an unsupported variable name, or a supported one with no value
  // and no configured fallback. Sending must be blocked while this is non-empty.
  missingVariables: string[];
  // Supported variables that were empty for this contact but filled via a
  // configured fallback — surfaced as a (non-blocking) warning in the UI.
  fallbacksUsed: string[];
}

export function extractVariables(template: string): string[] {
  const found = new Set<string>();
  for (const match of template.matchAll(VARIABLE_PATTERN)) {
    found.add(match[1]);
  }
  return Array.from(found);
}

export function renderTemplate(
  template: string,
  context: VariableContext,
  options: RenderOptions = {}
): RenderResult {
  const missing = new Set<string>();
  const fallbacksUsed = new Set<string>();

  const rendered = template.replace(VARIABLE_PATTERN, (full, rawName: string) => {
    const name = rawName as TemplateVariable;
    if (!SUPPORTED_VARIABLES.includes(name)) {
      missing.add(rawName);
      return full;
    }
    const value = context[name];
    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
    const fallback = options.fallbacks?.[name];
    if (fallback) {
      fallbacksUsed.add(rawName);
      return fallback;
    }
    missing.add(rawName);
    return full;
  });

  return {
    rendered,
    missingVariables: Array.from(missing),
    fallbacksUsed: Array.from(fallbacksUsed),
  };
}

// Convenience: render both subject and html/text bodies together and merge
// missing-variable results, so a caller only has to check one list before
// deciding whether a send is blocked.
export function renderEmail(
  parts: { subject: string; html: string; text?: string | null },
  context: VariableContext,
  options: RenderOptions = {}
): {
  subject: string;
  html: string;
  text: string | null;
  missingVariables: string[];
  fallbacksUsed: string[];
} {
  const subjectResult = renderTemplate(parts.subject, context, options);
  const htmlResult = renderTemplate(parts.html, context, options);
  const textResult = parts.text ? renderTemplate(parts.text, context, options) : null;

  const missing = new Set([
    ...subjectResult.missingVariables,
    ...htmlResult.missingVariables,
    ...(textResult?.missingVariables ?? []),
  ]);
  const fallbacksUsed = new Set([
    ...subjectResult.fallbacksUsed,
    ...htmlResult.fallbacksUsed,
    ...(textResult?.fallbacksUsed ?? []),
  ]);

  return {
    subject: subjectResult.rendered,
    html: htmlResult.rendered,
    text: textResult?.rendered ?? null,
    missingVariables: Array.from(missing),
    fallbacksUsed: Array.from(fallbacksUsed),
  };
}

export function buildVariableContext(contact: {
  name: string;
  company_name?: string | null;
  email: string;
  job_title?: string | null;
  sector?: string | null;
  country?: string | null;
  website?: string | null;
}, senderName: string, unsubscribeUrl: string): VariableContext {
  return {
    name: contact.name,
    first_name: firstNameOf(contact.name),
    company: contact.company_name ?? "",
    email: contact.email,
    job_title: contact.job_title ?? "",
    sector: contact.sector ?? "",
    country: contact.country ?? "",
    website: contact.website ?? "",
    sender_name: senderName,
    unsubscribe_url: unsubscribeUrl,
  };
}
