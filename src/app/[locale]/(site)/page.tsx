import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { MarketOverview } from "@/components/sections/MarketOverview";
import { Services } from "@/components/sections/Services";
import { OurClients } from "@/components/sections/OurClients";
import { ContactSection } from "@/components/sections/ContactSection";
import { buildAlternates } from "@/i18n/alternates";
import type { Locale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: buildAlternates("/", locale as Locale) };
}

export default function Home() {
  return (
    <>
      <Hero />
      <MarketOverview />
      <Services />
      <OurClients />
      <ContactSection />
    </>
  );
}
