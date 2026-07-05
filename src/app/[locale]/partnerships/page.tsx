import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { CTASection } from "@/components/site/CTASection";
import { FadeIn } from "@/components/ui/FadeIn";
import en from "@/messages/en.json";

export const metadata: Metadata = {
  title: "Partnerships — STRATIQ Access",
  description:
    "Local representative, Iraqi JV partner, tender partner, distributor/agent, EPC or execution support, and government-facing commercial support.",
};

export default async function PartnershipsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero
        eyebrow={en.partnerships.hero.eyebrow}
        title={en.partnerships.hero.title}
        description={en.partnerships.hero.description}
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-2">
          {en.partnerships.items.map((item, i) => (
            <FadeIn key={item} delay={i * 0.05}>
              <div className="flex items-center gap-4 border border-white/10 bg-navy-900/50 px-6 py-6">
                <span className="font-display text-2xl text-gold-500/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-silver-200">{item}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <CTASection
        title="Looking for a structured Iraqi partnership?"
        body="Tell us what kind of local partner or representation model you need."
        button="Submit Partnership Interest"
      />
    </>
  );
}
