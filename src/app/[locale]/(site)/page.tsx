import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Hero } from "@/components/sections/Hero";
import { MarketOverview } from "@/components/sections/MarketOverview";
import { Services } from "@/components/sections/Services";
import { OurClients } from "@/components/sections/OurClients";
import { ContactSection } from "@/components/sections/ContactSection";
import { buildAlternates } from "@/i18n/alternates";
import { buildOpenGraph } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.home" });
  const loc = locale as Locale;
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates("/", loc),
    ...buildOpenGraph({ title: t("title"), description: t("description"), path: "/", locale: loc }),
  };
}

export default function Home() {
  return (
    <>
      <Hero />
      <MarketOverview />
      <Services linkToIndex />
      <OurClients />
      <ContactSection />
    </>
  );
}
