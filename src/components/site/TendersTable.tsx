"use client";

import { useMemo, useState } from "react";
import { Lock } from "lucide-react";
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

const PROCUREMENT_TABS: { value: "all" | Opportunity["procurement_type"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "tender", label: "Tenders" },
  { value: "contract", label: "Contracts" },
  { value: "purchase_request", label: "Purchase Requests" },
];

const OWNERSHIP_TABS: { value: "all" | Opportunity["ownership"]; label: string }[] = [
  { value: "all", label: "All" },
  { value: "government", label: "Government" },
  { value: "private", label: "Private" },
];

const STATUS_TABS: { value: "all" | Opportunity["status"]; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "under_review", label: "Under Review" },
  { value: "awarded", label: "Awarded" },
  { value: "closed", label: "Closed" },
];

const statusDot: Record<string, string> = {
  open: "bg-teal-400",
  under_review: "bg-gold-400",
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
  const tone = days < 0 ? "border-muted-600 text-muted-600" : urgent ? "border-gold-400 text-gold-400" : "border-teal-400 text-teal-400";

  return (
    <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold tabular-nums", tone)}>
      {days < 0 ? "0" : days}
    </span>
  );
}

export function TendersTable({ items }: { items: Opportunity[] }) {
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
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                procurementType === tab.value
                  ? "bg-gold-500 text-navy-950"
                  : "text-muted-500 hover:text-ivory-100",
              )}
            >
              {tab.label}
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
              {tab.label}
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
              "border px-3.5 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors",
              status === tab.value
                ? "border-gold-500/50 text-gold-400"
                : "border-ivory-100/12 text-muted-600 hover:border-ivory-100/25 hover:text-ivory-100",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-md border border-dashed border-ivory-100/15 p-12 text-center text-[15px] text-muted-500">
          No opportunities match this filter yet.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-ivory-100/10">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ivory-100/10 bg-navy-950 text-left">
                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-muted-600">Reference</th>
                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-muted-600">Title</th>
                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-muted-600">Institution</th>
                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-muted-600">Location</th>
                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-muted-600">Published</th>
                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-muted-600">Closing</th>
                <th className="px-5 py-4 text-center text-xs font-medium uppercase tracking-wide text-muted-600">Remaining</th>
                <th className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-muted-600">Status</th>
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
                      {op.tender_type ?? (op.kind === "investment" ? "Investment Opportunity" : "Public Tender")}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-muted-500">{op.buyer ?? "Confidential"}</td>
                  <td className="px-5 py-4 text-muted-500">{op.location ?? "—"}</td>
                  <td className="px-5 py-4 text-muted-500">{op.published_at}</td>
                  <td className="px-5 py-4 text-muted-500">{op.deadline ?? "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-center">
                      <RemainingBadge deadline={op.deadline} status={op.status} />
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-2 text-xs font-medium capitalize text-ivory-100">
                      <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[op.status] ?? "bg-muted-600")} />
                      {op.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/tenders/${op.id}`}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap border border-ivory-100/15 px-3.5 py-2 text-xs font-medium text-ivory-100 transition-colors hover:border-gold-500/40 hover:text-gold-400"
                    >
                      {op.requires_nda && <Lock size={11} />}
                      Details
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
