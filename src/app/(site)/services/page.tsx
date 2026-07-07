import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Services } from "@/components/sections/Services";
import { ContactSection } from "@/components/sections/ContactSection";
import { getSiteImage } from "@/lib/siteImages";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Market entry, tender intelligence, local representation, and government liaison services for companies entering the Iraqi market.",
};

export default async function ServicesPage() {
  const heroImage = await getSiteImage("services_hero", "/images/photo-covered-market.jpg");

  return (
    <>
      <PageHero title="Our Services" image={heroImage} />

      <Services />
      <ContactSection />
    </>
  );
}
