import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/site/Hero";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceGrid } from "@/components/site/ServiceGrid";
import { SectorGrid } from "@/components/site/SectorGrid";
import { EngagementSteps } from "@/components/site/EngagementSteps";
import { ConfidentialityNotice } from "@/components/site/ConfidentialityNotice";
import { CTASection } from "@/components/site/CTASection";
import { FadeIn } from "@/components/ui/FadeIn";
import en from "@/messages/en.json";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations("home");
  const tBrand = useTranslations("brand");

  return (
    <>
      <Hero />

      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <FadeIn>
            <SectionHeading
              eyebrow={t("whoWeAre.eyebrow")}
              title={t("whoWeAre.title")}
            />
            {t("whoWeAre.body")
              .split("\n\n")
              .map((p, i) => (
                <p key={i} className="mt-5 text-sm leading-relaxed text-silver-300">
                  {p}
                </p>
              ))}
          </FadeIn>
          <FadeIn delay={0.1}>
            <SectionHeading
              eyebrow={t("whatWeDo.eyebrow")}
              title={t("whatWeDo.title")}
            />
            {t("whatWeDo.body")
              .split("\n\n")
              .map((p, i) => (
                <p key={i} className="mt-5 text-sm leading-relaxed text-silver-300">
                  {p}
                </p>
              ))}
          </FadeIn>
        </div>
      </Section>

      <Section className="border-t border-white/5 bg-navy-900/30">
        <SectionHeading
          eyebrow={t("servicesEyebrow")}
          title="Six disciplines, one structured route into Iraq."
          align="center"
          className="mx-auto mb-16"
        />
        <ServiceGrid items={en.services.items} />
      </Section>

      <Section>
        <SectionHeading
          eyebrow={t("sectorsEyebrow")}
          title={t("sectorsTitle")}
          align="center"
          className="mx-auto mb-16"
        />
        <SectorGrid items={en.sectors.items} />
      </Section>

      <Section className="border-t border-white/5 bg-navy-900/30">
        <FadeIn>
          <SectionHeading eyebrow={t("why.eyebrow")} title={t("why.title")} />
          {t("why.body")
            .split("\n\n")
            .map((p, i) => (
              <p key={i} className="mt-5 max-w-2xl text-sm leading-relaxed text-silver-300">
                {p}
              </p>
            ))}
        </FadeIn>
      </Section>

      <Section>
        <SectionHeading
          eyebrow={t("engagementEyebrow")}
          title="A structured, four-stage engagement model."
          className="mb-16"
        />
        <EngagementSteps steps={en.engagementSteps} />
      </Section>

      <Section className="border-t border-white/5 bg-navy-900/30">
        <div className="grid gap-10 lg:grid-cols-2">
          <FadeIn>
            <SectionHeading
              eyebrow={t("confidentiality.eyebrow")}
              title={t("confidentiality.title")}
            />
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-silver-300">
              {t("confidentiality.body")}
            </p>
          </FadeIn>
          <FadeIn delay={0.1} className="flex items-center">
            <ConfidentialityNotice text={tBrand("disclosureNotice")} />
          </FadeIn>
        </div>
      </Section>

      <CTASection
        title={t("finalCta.title")}
        body={t("finalCta.body")}
        button={t("finalCta.button")}
      />
    </>
  );
}
