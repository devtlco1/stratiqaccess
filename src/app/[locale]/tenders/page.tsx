import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import { ConfidentialityNotice } from "@/components/site/ConfidentialityNotice";
import { createClient } from "@/lib/supabase/server";
import en from "@/messages/en.json";

export const metadata: Metadata = {
  title: "Iraq Tenders — STRATIQ Access",
  description: "Qualified opportunities across Iraq's strategic sectors.",
};

const statusStyles: Record<string, string> = {
  open: "text-emerald-400 border-emerald-400/40",
  under_review: "text-gold-400 border-gold-400/40",
  awarded: "text-silver-300 border-silver-300/40",
  closed: "text-silver-400 border-silver-400/40",
};

async function getOpportunities() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("opportunities")
      .select("id, kind, title, buyer, location, country, deadline, status, tender_type, summary, tags, requires_nda")
      .eq("content_status", "published")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function TendersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const opportunities = await getOpportunities();

  return (
    <>
      <PageHero
        eyebrow={en.tenders.hero.eyebrow}
        title={en.tenders.hero.title}
        description={en.tenders.hero.description}
      />

      <Section>
        <div className="mb-10">
          <ConfidentialityNotice text={en.tenders.gatedNotice} />
        </div>

        {opportunities.length === 0 ? (
          <p className="text-sm text-silver-300">{en.tenders.empty}</p>
        ) : (
          <div className="space-y-4">
            {opportunities.map((op, i) => (
              <FadeIn key={op.id} delay={i * 0.04}>
                <Link
                  href={`/tenders/${op.id}`}
                  className="block border border-white/10 bg-navy-900/50 p-8 transition-colors hover:border-gold-500/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs uppercase tracking-[0.2em] text-gold-400">
                      {op.tender_type ?? (op.kind === "investment" ? "Investment Opportunity" : "Public Tender")}
                    </span>
                    <span
                      className={`border px-3 py-1 text-[11px] uppercase tracking-wide ${statusStyles[op.status] ?? ""}`}
                    >
                      {op.status.replace("_", " ")}
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-xl text-silver-100">{op.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-silver-300">{op.summary}</p>
                  <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 text-xs text-silver-400">
                    {op.location && <span>{en.tenders.labels.location}: {op.location}</span>}
                    {op.country && <span>{en.tenders.labels.country}: {op.country}</span>}
                    {op.deadline && <span>{en.tenders.labels.deadline}: {op.deadline}</span>}
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
