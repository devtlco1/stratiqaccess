import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/ui/FadeIn";
import { CTASection } from "@/components/site/CTASection";

export const metadata: Metadata = {
  title: "About — STRATIQ Access",
  description:
    "STRATIQ Access is a premium Iraq access platform operated by Abraj Al-Anwar, built on discretion, intelligence, and execution.",
};

type ValueItem = { title: string; body: string };

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tHome = await getTranslations("home");
  const tBrand = await getTranslations("brand");
  const values = t.raw("values") as ValueItem[];

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <FadeIn>
            <SectionHeading eyebrow={t("overview.eyebrow")} title={t("overview.title")} />
            {t("overview.body")
              .split("\n\n")
              .map((p, i) => (
                <p key={i} className="mt-5 text-[15px] leading-relaxed text-muted-500">
                  {p}
                </p>
              ))}
          </FadeIn>
          <FadeIn delay={0.1}>
            <SectionHeading eyebrow={t("accessModel.eyebrow")} title={t("accessModel.title")} />
            {t("accessModel.body")
              .split("\n\n")
              .map((p, i) => (
                <p key={i} className="mt-5 text-[15px] leading-relaxed text-muted-500">
                  {p}
                </p>
              ))}
          </FadeIn>
        </div>
      </Section>

      <Section className="border-t border-white/5 bg-navy-900/30">
        <SectionHeading
          eyebrow={t("valuesSection.eyebrow")}
          title={t("valuesSection.title")}
          align="center"
          className="mx-auto mb-16"
        />
        <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <FadeIn key={v.title} delay={i * 0.05} className="bg-navy-950 p-8">
              <h3 className="text-lg font-semibold text-cyan-300">{v.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-500">{v.body}</p>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section>
        <FadeIn className="glass-panel mx-auto max-w-3xl rounded-xl p-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">{t("legalStructure.eyebrow")}</p>
          <p className="mt-5 text-[15px] leading-relaxed text-muted-500">
            {tBrand("legalFooterExtended")}
          </p>
        </FadeIn>
      </Section>

      <CTASection
        title={tHome("finalCta.title")}
        body={tHome("finalCta.body")}
        button={tHome("finalCta.button")}
      />
    </>
  );
}
