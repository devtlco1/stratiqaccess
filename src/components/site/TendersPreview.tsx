import { Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { ConfidentialityNotice } from "@/components/site/ConfidentialityNotice";
import { createClient } from "@/lib/supabase/server";

const statusStyle: Record<string, string> = {
  open: "text-cyan-300 border-cyan-400/30 bg-cyan-500/10",
  under_review: "text-gold-400 border-gold-400/30 bg-gold-500/10",
  awarded: "text-muted-500 border-ivory-100/15 bg-ivory-100/5",
  closed: "text-muted-600 border-ivory-100/10 bg-ivory-100/5",
};

async function getPreviewTenders() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("opportunities")
      .select("id, title, buyer, deadline, status, requires_nda, kind, reference_no")
      .eq("content_status", "published")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3);
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function TendersPreview() {
  const tenders = await getPreviewTenders();
  const t = await getTranslations("tenders");
  const tBrand = await getTranslations("brand");

  return (
    <div>
      {tenders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ivory-100/15 p-10 text-center text-[15px] text-muted-500">
          {t("previewEmpty")}
        </div>
      ) : (
      <div className="grid gap-4 sm:grid-cols-3">
        {tenders.map((tender, i) => (
          <FadeIn key={tender.id} delay={i * 0.06}>
            <Link
              href={`/tenders/${tender.id}`}
              className="glow-card-hover block h-full rounded-xl border border-ivory-100/10 bg-navy-800/40 p-6 backdrop-blur-md"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-sm border px-2.5 py-1 text-xs font-medium ${statusStyle[tender.status] ?? ""}`}
                >
                  {t(`tabs.status.${tender.status === "under_review" ? "underReview" : tender.status}`)}
                </span>
                {tender.requires_nda && (
                  <span className="flex items-center gap-1.5 text-xs text-muted-600">
                    <Lock size={13} /> {t("ndaBadge")}
                  </span>
                )}
              </div>
              {tender.reference_no && (
                <p className="mt-4 text-xs font-medium text-muted-600">{tender.reference_no}</p>
              )}
              <h3 className="mt-1.5 text-[17px] font-medium leading-snug text-ivory-100">
                {tender.title}
              </h3>
              <dl className="mt-5 space-y-1.5 text-sm text-muted-500">
                <div className="flex justify-between gap-3">
                  <dt>{t("labels.buyer")}</dt>
                  <dd className="truncate text-end text-muted-600">{tender.buyer ?? t("confidentialFallback")}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>{t("labels.deadline")}</dt>
                  <dd className="text-muted-600">{tender.deadline ?? "—"}</dd>
                </div>
              </dl>
            </Link>
          </FadeIn>
        ))}
      </div>
      )}

      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:max-w-lg">
          <ConfidentialityNotice text={tBrand("disclosureNotice")} />
        </div>
        <Button href="/tenders" variant="outline" className="shrink-0">
          {t("viewIntelligenceButton")}
        </Button>
      </div>
    </div>
  );
}
