import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { SectorGrid } from "@/components/site/SectorGrid";
import { CTASection } from "@/components/site/CTASection";

export const metadata: Metadata = {
  title: "Sectors — STRATIQ Access",
  description:
    "Energy & power, smart metering, solar, ICT, telecom, data centers, EPC, industrial equipment, and government tenders in Iraq.",
};

type SectorItem = { slug: string; title: string };

export default async function SectorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("sectors");
  const items = t.raw("items") as SectorItem[];

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <Section>
        <SectorGrid items={items} />
      </Section>

      <CTASection
        title={t("cta.title")}
        body={t("cta.body")}
        button={t("cta.button")}
      />
    </>
  );
}
