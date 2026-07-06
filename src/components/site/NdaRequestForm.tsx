"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { requestNdaAccess, type SubmitNdaState } from "@/app/actions/nda";
import { Button } from "@/components/ui/Button";

const initialState: SubmitNdaState = { status: "idle" };
const fieldClasses =
  "w-full border border-white/15 bg-navy-900/50 px-4 py-3 text-sm text-silver-100 placeholder:text-silver-400 focus:border-gold-500/60 focus:outline-none";

export function NdaRequestForm({ opportunityId }: { opportunityId: string }) {
  const t = useTranslations("tenders.ndaForm");
  const tCommon = useTranslations("common");
  const [state, formAction, pending] = useActionState(requestNdaAccess, initialState);

  if (state.status === "success") {
    return (
      <div className="border border-gold-500/30 bg-gold-500/5 p-6 text-sm leading-relaxed text-silver-200">
        {t("success")}
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="opportunity_id" value={opportunityId} />
      <input className={fieldClasses} name="company_name" placeholder={t("companyNamePlaceholder")} required />
      <input className={fieldClasses} name="email" type="email" placeholder={t("emailPlaceholder")} required />
      <textarea className={fieldClasses} name="message" placeholder={t("messagePlaceholder")} rows={3} />
      {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}
      <Button type="submit" variant="outline" disabled={pending} className="w-full">
        {pending ? tCommon("submitting") : t("submit")}
      </Button>
    </form>
  );
}
