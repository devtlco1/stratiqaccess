import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { CTASection } from "@/components/site/CTASection";
import { ConfidentialityNotice } from "@/components/site/ConfidentialityNotice";
import { FadeIn } from "@/components/ui/FadeIn";
import { Button } from "@/components/ui/Button";
import en from "@/messages/en.json";

export const metadata: Metadata = {
  title: "Tender Intelligence — STRATIQ Access",
  description:
    "Tender monitoring, opportunity qualification, buyer and sector mapping, competitor intelligence, and confidential opportunity briefings for Iraq.",
};

export default async function TenderIntelligencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero
        eyebrow={en.tenderIntelligence.hero.eyebrow}
        title={en.tenderIntelligence.hero.title}
        description={en.tenderIntelligence.hero.description}
      />

      <Section>
        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {en.tenderIntelligence.sections.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.05} className="bg-navy-950 p-8">
              <h2 className="text-lg font-semibold text-ivory-100">{s.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-500">{s.body}</p>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section className="border-t border-white/5 bg-navy-900/30">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <ConfidentialityNotice text={en.brand.disclosureNotice} />
          <div className="flex justify-start lg:justify-end">
            <Button href="/tenders" variant="outline">
              View Public Opportunity Previews
            </Button>
          </div>
        </div>
      </Section>

      <CTASection
        title="Looking for opportunities in your sector?"
        body="Request a confidential tender intelligence briefing tailored to your company."
        button="Request Tender Intelligence Access"
      />
    </>
  );
}
