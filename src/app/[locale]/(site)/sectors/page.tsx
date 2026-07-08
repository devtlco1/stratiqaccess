import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { Sectors } from "@/components/sections/Sectors";
import { ContactSection } from "@/components/sections/ContactSection";
import { getSiteImage } from "@/lib/siteImages";
import { buildAlternates } from "@/i18n/alternates";
import type { Locale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.sectors" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates("/sectors", locale as Locale),
  };
}

export default async function SectorsPage() {
  const heroImage = await getSiteImage("sectors_hero", "/images/photo-baghdad-tigris.jpg");
  const t = await getTranslations("seo.sectors");

  return (
    <>
      <PageHero title={t("heroTitle")} image={heroImage} />

      <Sectors />
      <ContactSection />
    </>
  );
}
