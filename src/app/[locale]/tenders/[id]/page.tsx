import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { ConfidentialityNotice } from "@/components/site/ConfidentialityNotice";
import { NdaRequestForm } from "@/components/site/NdaRequestForm";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";
import en from "@/messages/en.json";

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

export default async function TenderDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const op = await getOpportunity(id);

  if (!op) notFound();

  const labels = en.tenders.labels;

  return (
    <>
      <PageHero
        eyebrow={op.tender_type ?? (op.kind === "investment" ? "Investment Opportunity" : "Public Tender")}
        title={op.reference_no ? `${op.reference_no} — ${op.title}` : op.title}
        description={op.summary}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <dl className="grid grid-cols-2 gap-6 border border-white/10 bg-navy-900/50 p-8 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs uppercase tracking-wide text-silver-400">Reference</dt>
                <dd className="mt-1 text-silver-200">{op.reference_no ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-silver-400">Ownership</dt>
                <dd className="mt-1 capitalize text-silver-200">{op.ownership}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-silver-400">{labels.buyer}</dt>
                <dd className="mt-1 text-silver-200">{op.buyer ?? "Confidential"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-silver-400">{labels.location}</dt>
                <dd className="mt-1 text-silver-200">{op.location ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-silver-400">{labels.country}</dt>
                <dd className="mt-1 text-silver-200">{op.country ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-silver-400">{labels.deadline}</dt>
                <dd className="mt-1 text-silver-200">{op.deadline ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-silver-400">{labels.status}</dt>
                <dd className="mt-1 capitalize text-silver-200">{op.status.replace("_", " ")}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-silver-400">{labels.type}</dt>
                <dd className="mt-1 text-silver-200">{op.tender_type ?? "—"}</dd>
              </div>
            </dl>

            {op.tags?.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {op.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="border border-white/10 px-3 py-1 text-xs uppercase tracking-wide text-silver-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-10">
              {op.requires_nda ? (
                <ConfidentialityNotice text={en.tenders.gatedNotice} />
              ) : (
                op.confidential_details && (
                  <div className="border border-white/10 bg-navy-900/50 p-8">
                    <h2 className="text-lg font-semibold text-ivory-100">Opportunity Details</h2>
                    <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-muted-500">
                      {op.confidential_details}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="border border-white/10 bg-navy-900/50 p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-400">{en.tenders.requestAccess}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-muted-500">
                {en.brand.disclosureNotice}
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
