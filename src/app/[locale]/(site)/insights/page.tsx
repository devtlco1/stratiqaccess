import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { Insights } from "@/components/sections/Insights";
import { ContactSection } from "@/components/sections/ContactSection";
import { getSiteImage } from "@/lib/siteImages";
import { buildAlternates } from "@/i18n/alternates";
import type { Locale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.insights" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates("/insights", locale as Locale),
  };
}

export default async function InsightsPage() {
  const heroImage = await getSiteImage("insights_hero", "/images/photo-erbil-expressway.jpg");
  const t = await getTranslations("seo.insights");

  return (
    <>
      <PageHero title={t("heroTitle")} image={heroImage} />

      <Insights />
      <ContactSection />
    </>
  );
}
