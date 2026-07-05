"use client";

import { useActionState } from "react";
import { requestNdaAccess, type SubmitNdaState } from "@/app/actions/nda";
import { Button } from "@/components/ui/Button";

const initialState: SubmitNdaState = { status: "idle" };
const fieldClasses =
  "w-full border border-white/15 bg-navy-900/50 px-4 py-3 text-sm text-silver-100 placeholder:text-silver-400 focus:border-gold-500/60 focus:outline-none";

export function NdaRequestForm({ opportunityId }: { opportunityId: string }) {
  const [state, formAction, pending] = useActionState(requestNdaAccess, initialState);

  if (state.status === "success") {
    return (
      <div className="border border-gold-500/30 bg-gold-500/5 p-6 text-sm leading-relaxed text-silver-200">
        Your access request has been received. Our team will follow up to arrange the appropriate
        NDA and engagement documentation.
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="opportunity_id" value={opportunityId} />
      <input className={fieldClasses} name="company_name" placeholder="Company name" required />
      <input className={fieldClasses} name="email" type="email" placeholder="Email" required />
      <textarea className={fieldClasses} name="message" placeholder="Brief context (optional)" rows={3} />
      {state.status === "error" && <p className="text-sm text-red-400">{state.message}</p>}
      <Button type="submit" variant="outline" disabled={pending} className="w-full">
        {pending ? "Submitting…" : "Request NDA & Full Access"}
      </Button>
    </form>
  );
}
