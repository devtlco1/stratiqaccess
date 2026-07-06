import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { ConfidentialityNotice } from "@/components/site/ConfidentialityNotice";
import { NdaRequestForm } from "@/components/site/NdaRequestForm";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

type OpportunityWithAttachments = Database["public"]["Tables"]["opportunities"]["Row"] & {
  opportunity_attachments: Database["public"]["Tables"]["opportunity_attachments"]["Row"][];
};

async function getOpportunity(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("opportunities")
      .select("*, opportunity_attachments(*)")
      .eq("id", id)
      .eq("content_status", "published")
      .returns<OpportunityWithAttachments[]>()
      .single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

const statusKey: Record<string, string> = {
  open: "open",
  under_review: "underReview",
  awarded: "awarded",
  closed: "closed",
};

export default async function TenderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tenders");
  const tBrand = await getTranslations("brand");
  const op = await getOpportunity(id);

  if (!op) notFound();

  const labels = t.raw("labels") as Record<string, string>;

  return (
    <>
      <PageHero
        eyebrow={op.tender_type ?? t(`kindLabels.${op.kind === "investment" ? "investment" : "tender"}`)}
        title={op.reference_no ? `${op.reference_no} — ${op.title}` : op.title}
        description={op.summary}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <dl className="glass-panel grid grid-cols-2 gap-6 rounded-xl p-8 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-600">{labels.reference}</dt>
                <dd className="mt-1 text-ivory-200">{op.reference_no ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-600">{labels.ownership}</dt>
                <dd className="mt-1 text-ivory-200">{t(`tabs.ownership.${op.ownership}`)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-600">{labels.buyer}</dt>
                <dd className="mt-1 text-ivory-200">{op.buyer ?? t("confidentialFallback")}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-600">{labels.location}</dt>
                <dd className="mt-1 text-ivory-200">{op.location ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-600">{labels.country}</dt>
                <dd className="mt-1 text-ivory-200">{op.country ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-600">{labels.deadline}</dt>
                <dd className="mt-1 text-ivory-200">{op.deadline ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-600">{labels.status}</dt>
                <dd className="mt-1 text-ivory-200">{t(`tabs.status.${statusKey[op.status]}`)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-600">{labels.type}</dt>
                <dd className="mt-1 text-ivory-200">{op.tender_type ?? "—"}</dd>
              </div>
            </dl>

            {op.tags?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {op.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full border border-blue-400/20 bg-blue-500/[0.06] px-3 py-1 text-xs uppercase tracking-wide text-cyan-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-10">
              {op.requires_nda ? (
                <ConfidentialityNotice text={t("gatedNotice")} />
              ) : (
                op.confidential_details && (
                  <div className="glass-panel rounded-xl p-8">
                    <h2 className="text-lg font-semibold text-ivory-100">{t("opportunityDetailsTitle")}</h2>
                    <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-muted-500">
                      {op.confidential_details}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="glass-panel glow-blue rounded-xl p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">{t("requestAccess")}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-500">
                {tBrand("disclosureNotice")}
              </p>
              <div className="mt-6">
                <NdaRequestForm opportunityId={op.id} />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
