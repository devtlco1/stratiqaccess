"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitLead, type SubmitLeadState } from "@/app/actions/leads";
import { Button } from "@/components/ui/Button";

const initialState: SubmitLeadState = { status: "idle" };

const fieldClasses =
  "w-full rounded-lg border border-white/15 bg-navy-900/50 px-4 py-3 text-sm text-ivory-100 placeholder:text-muted-600 transition-colors focus:border-gold-400/60 focus:outline-none";
const labelClasses = "mb-2 block text-xs uppercase tracking-wide text-muted-500";

export function ContactForm({
  interests,
  labels,
  successMessage,
  errorMessage,
  submitLabel,
  defaultInterest,
  formType = "general",
}: {
  interests: string[];
  labels: {
    companyName: string;
    contactPerson: string;
    email: string;
    country: string;
    sector: string;
    interest: string;
    message: string;
  };
  successMessage: string;
  errorMessage: string;
  submitLabel: string;
  defaultInterest?: string;
  formType?: "general" | "market_entry" | "representation" | "partnership" | "tender_intelligence";
}) {
  const tCommon = useTranslations("common");
  const [state, formAction, pending] = useActionState(submitLead, initialState);

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-gold-400/25 bg-gold-400/5 p-8 text-sm leading-relaxed text-ivory-200">
        {successMessage}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="form_type" value={formType} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className={labelClasses} htmlFor="company_name">{labels.companyName}</label>
          <input className={fieldClasses} id="company_name" name="company_name" required />
        </div>
        <div>
          <label className={labelClasses} htmlFor="contact_person">{labels.contactPerson}</label>
          <input className={fieldClasses} id="contact_person" name="contact_person" required />
        </div>
        <div>
          <label className={labelClasses} htmlFor="email">{labels.email}</label>
          <input className={fieldClasses} id="email" name="email" type="email" required />
        </div>
        <div>
          <label className={labelClasses} htmlFor="country">{labels.country}</label>
          <input className={fieldClasses} id="country" name="country" required />
        </div>
        <div>
          <label className={labelClasses} htmlFor="sector">{labels.sector}</label>
          <input className={fieldClasses} id="sector" name="sector" />
        </div>
        <div>
          <label className={labelClasses} htmlFor="service_interest">{labels.interest}</label>
          <select
            className={fieldClasses}
            id="service_interest"
            name="service_interest"
            defaultValue={defaultInterest ?? ""}
          >
            <option value="" disabled>
              —
            </option>
            {interests.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClasses} htmlFor="message">{labels.message}</label>
        <textarea className={fieldClasses} id="message" name="message" rows={5} required />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-400">{state.message ?? errorMessage}</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? tCommon("submitting") : submitLabel}
      </Button>
    </form>
  );
}
