import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { OurClients } from "@/components/sections/OurClients";
import { ContactSection } from "@/components/sections/ContactSection";
import { getSiteImage } from "@/lib/siteImages";
import { buildAlternates } from "@/i18n/alternates";
import type { Locale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.clients" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates("/clients", locale as Locale),
  };
}

export default async function ClientsPage() {
  const heroImage = await getSiteImage("clients_hero", "/images/photo-baghdad-2023.jpg");
  const t = await getTranslations("seo.clients");

  return (
    <>
      <PageHero title={t("heroTitle")} image={heroImage} />

      <OurClients showWhenEmpty />
      <ContactSection />
    </>
  );
}
