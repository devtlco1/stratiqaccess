"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitContactForm, type ContactFormState } from "./contactActions";

const initialState: ContactFormState = { status: "idle" };

export function ContactForm() {
  const t = useTranslations("contact.form");
  const [state, formAction, pending] = useActionState(submitContactForm, initialState);

  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-paper border border-navy/10 p-10 text-center">
        <h3 className="font-display text-2xl text-navy">{t("successTitle")}</h3>
        <p className="mt-3 text-ink/70">{t("successMessage")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <Field label={t("firstName")} name="firstName" required />
      <Field label={t("lastName")} name="lastName" required />
      <Field label={t("jobTitle")} name="jobTitle" />
      <Field label={t("companyName")} name="companyName" required />
      <Field label={t("country")} name="country" required />
      <Field label={t("phone")} name="phone" type="tel" />
      <Field label={t("email")} name="email" type="email" required className="sm:col-span-2" />

      <div className="sm:col-span-2">
        <label htmlFor="rfpFiles" className="block text-sm font-medium text-ink/80 mb-2">
          {t("attachments")}
        </label>
        <input
          id="rfpFiles"
          name="rfpFiles"
          type="file"
          accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.webp,.xls,.xlsx,.ppt,.pptx"
          className="w-full rounded-lg border border-navy/15 bg-white px-4 py-3 text-sm text-ink/70 file:me-4 file:rounded-full file:border-0 file:bg-navy/5 file:px-4 file:py-2 file:text-sm file:font-medium file:text-navy"
        />
        <p className="mt-1.5 text-xs text-ink/50">{t("attachmentsHelp")}</p>
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="message" className="block text-sm font-medium text-ink/80 mb-2">
          {t("message")}
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="w-full rounded-lg border border-navy/15 bg-white px-4 py-3 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20 transition-colors duration-200"
        />
      </div>

      {state.status === "error" && (
        <p className="sm:col-span-2 text-sm text-red-600">
          {state.errorCode === "missingFields" ? t("errorMissingFields") : t("errorServer")}
        </p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center rounded-md bg-stratiq-blue px-10 py-3.5 text-sm font-semibold uppercase tracking-wide text-white transition-all duration-300 hover:bg-navy hover:scale-[1.03] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
        >
          {pending ? t("sending") : t("send")}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  className = "",
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-ink/80 mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-navy/15 bg-white px-4 py-3 text-sm focus:border-stratiq-blue focus:outline-none focus:ring-2 focus:ring-stratiq-blue/20 transition-colors duration-200"
      />
    </div>
  );
}
