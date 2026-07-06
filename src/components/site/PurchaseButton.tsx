"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { purchaseReport, type PurchaseState } from "@/app/actions/purchase";
import { Button } from "@/components/ui/Button";

const initialState: PurchaseState = { status: "idle" };

export function PurchaseButton({ reportId, label }: { reportId: string; label: string }) {
  const t = useTranslations("common");
  const [state, formAction, pending] = useActionState(purchaseReport, initialState);

  if (state.status === "manual") {
    return (
      <div className="rounded-lg border border-gold-400/25 bg-gold-400/5 p-6 text-sm leading-relaxed text-ivory-200">
        {state.message}
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="report_id" value={reportId} />
      {state.status === "error" && <p className="mb-3 text-sm text-red-400">{state.message}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? t("processing") : label}
      </Button>
    </form>
  );
}
