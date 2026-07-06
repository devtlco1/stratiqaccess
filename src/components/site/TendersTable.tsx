"use client";

import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Database } from "@/lib/supabase/types";

type Opportunity = Pick<
  Database["public"]["Tables"]["opportunities"]["Row"],
  | "id"
  | "kind"
  | "title"
  | "buyer"
  | "location"
  | "country"
  | "deadline"
  | "status"
  | "tender_type"
  | "reference_no"
  | "ownership"
  | "procurement_type"
  | "published_at"
  | "requires_nda"
>;

const PROCUREMENT_TABS: { value: "all" | Opportunity["procurement_type"]; key: string }[] = [
  { value: "all", key: "all" },
  { value: "tender", key: "tenders" },
  { value: "contract", key: "contracts" },
  { value: "purchase_request", key: "purchaseRequests" },
];

const OWNERSHIP_TABS: { value: "all" | Opportunity["ownership"]; key: string }[] = [
  { value: "all", key: "all" },
  { value: "government", key: "government" },
  { value: "private", key: "private" },
];

const STATUS_TABS: { value: "all" | Opportunity["status"]; key: string }[] = [
  { value: "all", key: "all" },
  { value: "open", key: "open" },
  { value: "under_review", key: "underReview" },
  { value: "awarded", key: "awarded" },
  { value: "closed", key: "closed" },
];

const statusDot: Record<string, string> = {
  open: "bg-gold-300",
  under_review: "bg-gold-500",
  awarded: "bg-muted-500",
  closed: "bg-muted-600",
};

function daysRemaining(deadline: string | null) {
  if (!deadline) return null;
  const diff = Math.ceil(
    (new Date(deadline).getTime() - new Date(new Date().toDateString()).getTime()) / 86_400_000,
  );
  return diff;
}

function RemainingBadge({ deadline, status }: { deadline: string | null; status: string }) {
  const days = daysRemaining(deadline);

  if (status === "closed" || status === "awarded" || days === null) {
    return <span className="text-sm text-muted-600">—</span>;
  }

  const urgent = days <= 7;
  const tone = days < 0 ? "border-muted-600 text-muted-600" : urgent ? "border-gold-500 text-gold-500" : "border-gold-300 text-gold-300";

  return (
    <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold tabular-nums", tone)}>
      {days < 0 ? "0" : days}
    </span>
  );
}

export function TendersTable({ items }: { items: Opportunity[] }) {
  const t = useTranslations("tenders");
  const [procurementType, setProcurementType] = useState<"all" | Opportunity["procurement_type"]>("all");
  const [ownership, setOwnership] = useState<"all" | Opportunity["ownership"]>("all");
  const [status, setStatus] = useState<"all" | Opportunity["status"]>("all");

  const filtered = useMemo(
    () =>
      items.filter(
        (op) =>
          (procurementType === "all" || op.procurement_type === procurementType) &&
          (ownership === "all" || op.ownership === ownership) &&
          (status === "all" || op.status === status),
      ),
    [items, procurementType, ownership, status],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory-100/10 pb-5">
        <div className="flex flex-wrap gap-2">
          {PROCUREMENT_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setProcurementType(tab.value)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                procurementType === tab.value
                  ? "bg-gradient-to-r from-gold-600 to-gold-400 text-navy-950 shadow-[0_4px_20px_-6px_rgba(200,163,90,0.5)]"
                  : "text-muted-500 hover:text-ivory-100",
              )}
            >
              {t(`tabs.procurement.${tab.key}`)}
            </button>
          ))}
        </div>

        <div className="flex gap-1 rounded-full border border-ivory-100/12 p-1">
          {OWNERSHIP_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setOwnership(tab.value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                ownership === tab.value ? "bg-ivory-100/10 text-ivory-100" : "text-muted-600 hover:text-ivory-100",
              )}
            >
              {t(`tabs.ownership.${tab.key}`)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 py-5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={cn(
              "rounded-md border px-3.5 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors",
              status === tab.value
                ? "border-gold-400/50 bg-gold-400/[0.06] text-gold-300"
                : "border-ivory-100/12 text-muted-600 hover:border-ivory-100/25 hover:text-ivory-100",
            )}
          >
            {t(`tabs.status.${tab.key}`)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ivory-100/15 p-12 text-center text-[15px] text-muted-500">
          {t("noMatch")}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-ivory-100/10 bg-navy-900/30 backdrop-blur-sm">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ivory-100/10 bg-navy-950 text-start">
                <th className="px-5 py-4 text-start text-xs font-medium uppercase tracking-wide text-muted-600">{t("columns.reference")}</th>
                <th className="px-5 py-4 text-start text-xs font-medium uppercase tracking-wide text-muted-600">{t("columns.title")}</th>
                <th className="px-5 py-4 text-start text-xs font-medium uppercase tracking-wide text-muted-600">{t("columns.institution")}</th>
                <th className="px-5 py-4 text-start text-xs font-medium uppercase tracking-wide text-muted-600">{t("columns.location")}</th>
                <th className="px-5 py-4 text-start text-xs font-medium uppercase tracking-wide text-muted-600">{t("columns.published")}</th>
                <th className="px-5 py-4 text-start text-xs font-medium uppercase tracking-wide text-muted-600">{t("columns.closing")}</th>
                <th className="px-5 py-4 text-center text-xs font-medium uppercase tracking-wide text-muted-600">{t("columns.remaining")}</th>
                <th className="px-5 py-4 text-start text-xs font-medium uppercase tracking-wide text-muted-600">{t("columns.status")}</th>
                <th className="px-5 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ivory-100/8">
              {filtered.map((op) => (
                <tr key={op.id} className="transition-colors hover:bg-navy-800/40">
                  <td className="px-5 py-4 text-muted-500">{op.reference_no ?? "—"}</td>
                  <td className="max-w-xs px-5 py-4">
                    <p className="font-medium text-ivory-100">{op.title}</p>
                    <p className="mt-0.5 text-xs text-muted-600">
                      {op.tender_type ?? t(`kindLabels.${op.kind === "investment" ? "investment" : "tender"}`)}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-muted-500">{op.buyer ?? t("confidentialFallback")}</td>
                  <td className="px-5 py-4 text-muted-500">{op.location ?? "—"}</td>
                  <td className="px-5 py-4 text-muted-500">{op.published_at}</td>
                  <td className="px-5 py-4 text-muted-500">{op.deadline ?? "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center">
                      <RemainingBadge deadline={op.deadline} status={op.status} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-2 text-xs font-medium text-ivory-100">
                      <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[op.status] ?? "bg-muted-600")} />
                      {t(`tabs.status.${op.status === "under_review" ? "underReview" : op.status}`)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-end">
                    <Link
                      href={`/tenders/${op.id}`}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border border-ivory-100/15 px-3.5 py-2 text-xs font-medium text-ivory-100 transition-colors hover:border-gold-400/40 hover:text-gold-300"
                    >
                      {op.requires_nda && <Lock size={11} />}
                      {t("detailsLink")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
