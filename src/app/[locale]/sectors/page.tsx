import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { SectorGrid } from "@/components/site/SectorGrid";
import { CTASection } from "@/components/site/CTASection";
import en from "@/messages/en.json";

export const metadata: Metadata = {
  title: "Sectors — STRATIQ Access",
  description:
    "Energy & power, smart metering, solar, ICT, telecom, data centers, EPC, industrial equipment, and government tenders in Iraq.",
};

export default async function SectorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero
        eyebrow={en.sectors.hero.eyebrow}
        title={en.sectors.hero.title}
        description={en.sectors.hero.description}
      />

      <Section>
        <SectorGrid items={en.sectors.items} />
      </Section>

      <CTASection
        title="Working in one of these sectors?"
        body="Request a confidential briefing on opportunities relevant to your sector and capability."
        button="Request Sector Briefing"
      />
    </>
  );
}
