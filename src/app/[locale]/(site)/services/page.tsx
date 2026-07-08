import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { Services } from "@/components/sections/Services";
import { ContactSection } from "@/components/sections/ContactSection";
import { getSiteImage } from "@/lib/siteImages";
import { buildAlternates } from "@/i18n/alternates";
import type { Locale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.services" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates("/services", locale as Locale),
  };
}

export default async function ServicesPage() {
  const heroImage = await getSiteImage("services_hero", "/images/photo-covered-market.jpg");
  const t = await getTranslations("seo.services");

  return (
    <>
      <PageHero title={t("heroTitle")} image={heroImage} />

      <Services />
      <ContactSection />
    </>
  );
}
