import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Insights } from "@/components/sections/Insights";
import { ContactSection } from "@/components/sections/ContactSection";
import { getSiteImage } from "@/lib/siteImages";

export const metadata: Metadata = {
  title: "Insights",
  description: "STRATIQ Access views on Iraq's tender landscape, energy and infrastructure, digital transformation, and local partnerships.",
};

export default async function InsightsPage() {
  const heroImage = await getSiteImage("insights_hero", "/images/photo-erbil-expressway.jpg");

  return (
    <>
      <PageHero title="Insights" image={heroImage} />

      <Insights />
      <ContactSection />
    </>
  );
}
