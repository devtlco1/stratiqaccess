import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { CTASection } from "@/components/site/CTASection";
import { FadeIn } from "@/components/ui/FadeIn";

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
  const t = await getTranslations("partnerships");
  const items = t.raw("items") as string[];

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <Section>
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item, i) => (
            <FadeIn key={item} delay={i * 0.05}>
              <div className="glow-card-hover flex items-center gap-4 rounded-lg border border-white/10 bg-navy-900/50 px-6 py-6">
                <span className="font-display text-2xl text-cyan-400/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm text-ivory-200">{item}</span>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <CTASection
        title={t("cta.title")}
        body={t("cta.body")}
        button={t("cta.button")}
      />
    </>
  );
}
