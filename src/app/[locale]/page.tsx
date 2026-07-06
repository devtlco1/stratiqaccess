import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/site/Hero";
import { TrustStrip } from "@/components/site/TrustStrip";
import { Section } from "@/components/site/Section";
import { SectionRail } from "@/components/site/SectionRail";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ServiceGrid } from "@/components/site/ServiceGrid";
import { SectorGrid } from "@/components/site/SectorGrid";
import { HowWeWork } from "@/components/site/HowWeWork";
import { TendersPreview } from "@/components/site/TendersPreview";
import { ConfidentialityNotice } from "@/components/site/ConfidentialityNotice";
import { CTASection } from "@/components/site/CTASection";
import { FadeIn } from "@/components/ui/FadeIn";
import { createClient } from "@/lib/supabase/server";
import en from "@/messages/en.json";

async function getHeroCounts() {
  try {
    const supabase = await createClient();
    const [opportunities, sectors, services] = await Promise.all([
      supabase
        .from("opportunities")
        .select("id", { count: "exact", head: true })
        .eq("status", "open")
        .eq("content_status", "published"),
      supabase.from("sectors").select("id", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("services").select("id", { count: "exact", head: true }).eq("status", "published"),
    ]);

    return {
      activeOpportunities: opportunities.count ?? 0,
      sectorsCount: sectors.count ?? en.sectors.items.length,
      servicesCount: services.count ?? en.services.items.length,
    };
  } catch {
    return {
      activeOpportunities: 0,
      sectorsCount: en.sectors.items.length,
      servicesCount: en.services.items.length,
    };
  }
}

type ServiceItem = { slug: string; title: string; summary: string };
type SectorItem = { slug: string; title: string };
type EngagementStep = { step: string; title: string; body: string };

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const heroCounts = await getHeroCounts();
  return <HomeContent heroCounts={heroCounts} />;
}

function HomeContent({
  heroCounts,
}: {
  heroCounts: { activeOpportunities: number; sectorsCount: number; servicesCount: number };
}) {
  const t = useTranslations("home");
  const tBrand = useTranslations("brand");
  const tRoot = useTranslations();
  const tServices = useTranslations("services");
  const tSectors = useTranslations("sectors");
  const serviceItems = tServices.raw("items") as ServiceItem[];
  const sectorItems = tSectors.raw("items") as SectorItem[];
  const engagementSteps = tRoot.raw("engagementSteps") as EngagementStep[];
  const tRail = useTranslations("home.rail");
  const railSections = [
    { id: "about", label: tRail("about") },
    { id: "services", label: tRail("services") },
    { id: "sectors", label: tRail("sectors") },
    { id: "how-it-works", label: tRail("howItWorks") },
    { id: "contact", label: tRail("contact") },
  ];

  return (
    <>
      <Hero {...heroCounts} />
      <SectionRail sections={railSections} />
      <TrustStrip />

      {/* What STRATIQ Access Does */}
      <Section id="about">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <FadeIn>
            <SectionHeading
              eyebrow={t("whoWeAre.eyebrow")}
              title={t("whoWeAre.title")}
            />
            {t("whoWeAre.body")
              .split("\n\n")
              .map((p, i) => (
                <p key={i} className="mt-5 text-[15px] leading-relaxed text-muted-500">
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
                <p key={i} className="mt-5 text-[15px] leading-relaxed text-muted-500">
                  {p}
                </p>
              ))}
          </FadeIn>
        </div>
      </Section>

      {/* Services */}
      <Section id="services" className="border-t border-ivory-100/8 bg-navy-950">
        <SectionHeading
          eyebrow={t("servicesEyebrow")}
          title={t("servicesTitle")}
          align="center"
          className="mx-auto mb-16"
        />
        <ServiceGrid items={serviceItems} />
      </Section>

      {/* Iraq Tenders preview */}
      <Section className="border-t border-ivory-100/8">
        <SectionHeading
          eyebrow={t("tendersEyebrow")}
          title={t("tendersTitle")}
          align="center"
          className="mx-auto mb-16"
        />
        <TendersPreview />
      </Section>

      {/* Sectors */}
      <Section id="sectors" className="border-t border-ivory-100/8 bg-navy-950">
        <SectionHeading
          eyebrow={t("sectorsEyebrow")}
          title={t("sectorsTitle")}
          align="center"
          className="mx-auto mb-16"
        />
        <SectorGrid items={sectorItems} />
      </Section>

      {/* How We Work */}
      <Section id="how-it-works" className="border-t border-ivory-100/8">
        <SectionHeading
          eyebrow={t("howWeWorkEyebrow")}
          title={t("howWeWorkTitle")}
          className="mb-16"
        />
        <HowWeWork steps={engagementSteps} />
      </Section>

      {/* Confidentiality & Protection */}
      <Section className="border-t border-ivory-100/8 bg-navy-950">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <FadeIn>
            <SectionHeading
              eyebrow={t("confidentiality.eyebrow")}
              title={t("confidentiality.title")}
            />
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-muted-500">
              {t("confidentiality.body")}
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <ConfidentialityNotice text={tBrand("disclosureNotice")} />
          </FadeIn>
        </div>
      </Section>

      {/* Why STRATIQ Access */}
      <Section className="border-t border-ivory-100/8">
        <FadeIn>
          <SectionHeading eyebrow={t("why.eyebrow")} title={t("why.title")} />
          {t("why.body")
            .split("\n\n")
            .map((p, i) => (
              <p key={i} className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted-500">
                {p}
              </p>
            ))}
        </FadeIn>
      </Section>

      <CTASection
        id="contact"
        title={t("finalCta.title")}
        body={t("finalCta.body")}
        button={t("finalCta.button")}
      />
    </>
  );
}
