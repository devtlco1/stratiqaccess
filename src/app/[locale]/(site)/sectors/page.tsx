import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { Sectors } from "@/components/sections/Sectors";
import { ContactSection } from "@/components/sections/ContactSection";
import { getSiteImage } from "@/lib/siteImages";
import { buildAlternates } from "@/i18n/alternates";
import { buildOpenGraph, buildBreadcrumbList } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.sectors" });
  const loc = locale as Locale;
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates("/sectors", loc),
    ...buildOpenGraph({ title: t("title"), description: t("description"), path: "/sectors", locale: loc }),
  };
}

export default async function SectorsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const loc = locale as Locale;
  const heroImage = await getSiteImage("sectors_hero", "/images/photo-baghdad-tigris.jpg");
  const t = await getTranslations("seo.sectors");
  const tNav = await getTranslations("navigation");

  return (
    <>
      <JsonLd
        data={buildBreadcrumbList([{ name: t("heroTitle"), path: "/sectors" }], loc, tNav("home"))}
      />
      <PageHero title={t("heroTitle")} image={heroImage} />

      <Sectors page={page} />
      <ContactSection />
    </>
  );
}
