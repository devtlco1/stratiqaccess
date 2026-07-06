import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { CTASection } from "@/components/site/CTASection";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Iraq Market Access — STRATIQ Access",
  description:
    "How international companies enter the Iraqi market: local partner models, tender registration, opportunity mapping, and representation safeguards.",
};

type AccessSection = { title: string; body: string };

export default async function IraqMarketAccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("iraqMarketAccess");
  const sections = t.raw("sections") as AccessSection[];

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          {sections.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.05}>
              <div className="h-full border border-white/10 bg-navy-900/50 p-8">
                <h2 className="text-xl font-semibold text-ivory-100">{s.title}</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-500">{s.body}</p>
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
