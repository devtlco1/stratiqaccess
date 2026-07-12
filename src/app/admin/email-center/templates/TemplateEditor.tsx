"use client";

import { useRef, useState } from "react";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { SUPPORTED_VARIABLES } from "@/lib/email/templateVariables";
import type { EmailContactRow, EmailTemplateRow } from "@/lib/email/dbTypes";
import { previewTemplate, sendTestTemplateEmail, type PreviewResult } from "./actions";

type TextTarget = "subject" | "html_body" | "text_body";

export function TemplateEditor({
  template,
  contacts,
  action,
}: {
  template?: EmailTemplateRow;
  contacts: EmailContactRow[];
  action: (formData: FormData) => void;
}) {
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [htmlBody, setHtmlBody] = useState(template?.html_body ?? "");
  const [textBody, setTextBody] = useState(template?.text_body ?? "");
  const [isActive, setIsActive] = useState(template?.is_active ?? true);

  const subjectRef = useRef<HTMLInputElement>(null);
  const htmlRef = useRef<HTMLTextAreaElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const [focusedField, setFocusedField] = useState<TextTarget>("html_body");

  const [previewContactId, setPreviewContactId] = useState("");
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile" | "text">("desktop");
  const [previewLoading, setPreviewLoading] = useState(false);

  const [testEmail, setTestEmail] = useState("");
  const [testResult, setTestResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  function insertVariable(variable: string) {
    const token = `{{${variable}}}`;
    if (focusedField === "subject") {
      const input = subjectRef.current;
      const pos = input?.selectionStart ?? subject.length;
      const next = subject.slice(0, pos) + token + subject.slice(pos);
      setSubject(next);
    } else if (focusedField === "html_body") {
      const el = htmlRef.current;
      const pos = el?.selectionStart ?? htmlBody.length;
      const next = htmlBody.slice(0, pos) + token + htmlBody.slice(pos);
      setHtmlBody(next);
    } else {
      const el = textRef.current;
      const pos = el?.selectionStart ?? textBody.length;
      const next = textBody.slice(0, pos) + token + textBody.slice(pos);
      setTextBody(next);
    }
  }

  async function runPreview() {
    setPreviewLoading(true);
    try {
      const result = await previewTemplate(subject, htmlBody, textBody || null, previewContactId || null);
      setPreview(result);
    } finally {
      setPreviewLoading(false);
    }
  }

  async function runTestSend() {
    setTestLoading(true);
    setTestResult(null);
    try {
      const result = await sendTestTemplateEmail(subject, htmlBody, textBody || null, testEmail, previewContactId || null);
      setTestResult(result);
    } finally {
      setTestLoading(false);
    }
  }

  return (
    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <form action={action} className="flex flex-col gap-6">
        <Field label="Template Name" name="name" defaultValue={template?.name} required />
        <Field label="Internal Description" name="description" defaultValue={template?.description ?? undefined} />

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-ink/80 mb-1.5">Subject</label>
          <input
            ref={subjectRef}
            id="subject"
            name="subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            onFocus={() => setFocusedField("subject")}
            className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
          />
        </div>

        <VariablePicker onInsert={insertVariable} />

        <div>
          <label htmlFor="html_body" className="block text-sm font-medium text-ink/80 mb-1.5">Email Body (HTML)</label>
          <textarea
            ref={htmlRef}
            id="html_body"
            name="html_body"
            required
            rows={14}
            value={htmlBody}
            onChange={(e) => setHtmlBody(e.target.value)}
            onFocus={() => setFocusedField("html_body")}
            className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm font-mono focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="text_body" className="block text-sm font-medium text-ink/80">Plain-Text Fallback</label>
            <button
              type="button"
              onClick={() => setTextBody(htmlBody.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())}
              className="text-xs font-semibold text-stratiq-blue hover:text-navy"
            >
              Generate from HTML
            </button>
          </div>
          <textarea
            ref={textRef}
            id="text_body"
            name="text_body"
            rows={6}
            value={textBody}
            onChange={(e) => setTextBody(e.target.value)}
            onFocus={() => setFocusedField("text_body")}
            className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
          />
        </div>

        <Field label="Default Language" name="default_language" defaultValue={template?.default_language ?? "en"} />

        <label className="flex items-center gap-2 text-sm text-ink/80">
          <input type="checkbox" name="is_active" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4 rounded border-navy/30" />
          Active (available to select in campaigns)
        </label>

        <SubmitButton>{template ? "Save Template" : "Create Template"}</SubmitButton>
      </form>

      <div className="flex flex-col gap-4">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg text-navy">Preview</h2>
          <div className="mt-3 flex items-center gap-3">
            <select
              value={previewContactId}
              onChange={(e) => setPreviewContactId(e.target.value)}
              className="flex-1 rounded-lg border border-navy/15 px-3 py-2 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
            >
              <option value="">Sample contact</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
              ))}
            </select>
            <button
              type="button"
              onClick={runPreview}
              disabled={previewLoading}
              className="rounded-md bg-stratiq-blue px-4 py-2 text-sm font-semibold text-white hover:bg-navy transition-colors disabled:opacity-60"
            >
              {previewLoading ? "Rendering…" : "Preview"}
            </button>
          </div>

          {preview && (
            <>
              {preview.missingVariables.length > 0 && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Unresolved variables — sending is blocked until these have a value or fallback: {preview.missingVariables.join(", ")}
                </p>
              )}
              {preview.fallbacksUsed.length > 0 && (
                <p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-800">
                  Filled via fallback: {preview.fallbacksUsed.join(", ")}
                </p>
              )}

              <div className="mt-3 flex gap-2 border-b border-navy/10">
                {(["desktop", "mobile", "text"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setPreviewDevice(d)}
                    className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${previewDevice === d ? "border-stratiq-blue text-navy" : "border-transparent text-ink/50 hover:text-navy"}`}
                  >
                    {d === "desktop" ? "Desktop" : d === "mobile" ? "Mobile" : "Plain Text"}
                  </button>
                ))}
              </div>

              <div className="mt-3 rounded-lg border border-navy/10 bg-paper p-3">
                <p className="text-xs text-ink/50 mb-2">Subject: {preview.subject}</p>
                <div className={`mx-auto overflow-auto rounded bg-white p-4 ${previewDevice === "mobile" ? "max-w-[375px]" : "w-full"}`}>
                  {previewDevice === "text" ? (
                    <pre className="whitespace-pre-wrap text-xs text-ink/80">{preview.text}</pre>
                  ) : (
                    <div className="text-sm" dangerouslySetInnerHTML={{ __html: preview.html }} />
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg text-navy">Send Test Email</h2>
          <p className="mt-1 text-xs text-ink/60">Sends only to the address you enter here — never to a real contact.</p>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="you@stratiqaccess.com"
              className="flex-1 rounded-lg border border-navy/15 px-3 py-2 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
            />
            <button
              type="button"
              onClick={runTestSend}
              disabled={testLoading || !testEmail}
              className="rounded-md border border-navy/15 px-4 py-2 text-sm font-semibold text-navy hover:bg-paper transition-colors disabled:opacity-60"
            >
              {testLoading ? "Sending…" : "Send Test"}
            </button>
          </div>
          {testResult && (
            <p className={`mt-3 text-sm ${testResult.success ? "text-green-700" : "text-red-700"}`}>
              {testResult.success ? "Test email sent." : testResult.error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function VariablePicker({ onInsert }: { onInsert: (variable: string) => void }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50 mb-1.5">Insert Variable</p>
      <div className="flex flex-wrap gap-1.5">
        {SUPPORTED_VARIABLES.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onInsert(v)}
            className="rounded-md bg-paper px-2.5 py-1 text-xs font-mono text-navy hover:bg-navy/10 transition-colors"
          >
            {`{{${v}}}`}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink/80 mb-1.5">{label}</label>
      <input
        id={name}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-navy/15 px-4 py-2.5 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20"
      />
    </div>
  );
}
