import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { Services } from "@/components/sections/Services";
import { ContactSection } from "@/components/sections/ContactSection";
import { getSiteImage } from "@/lib/siteImages";
import { buildAlternates } from "@/i18n/alternates";
import { buildOpenGraph, buildBreadcrumbList } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.services" });
  const loc = locale as Locale;
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates("/services", loc),
    ...buildOpenGraph({ title: t("title"), description: t("description"), path: "/services", locale: loc }),
  };
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  const loc = locale as Locale;
  const heroImage = await getSiteImage("services_hero", "/images/photo-covered-market.jpg");
  const t = await getTranslations("seo.services");
  const tNav = await getTranslations("navigation");

  return (
    <>
      <JsonLd
        data={buildBreadcrumbList([{ name: t("heroTitle"), path: "/services" }], loc, tNav("home"))}
      />
      <PageHero title={t("heroTitle")} image={heroImage} />

      <Services />
      <ContactSection />
    </>
  );
}
