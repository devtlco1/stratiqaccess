import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Sectors } from "@/components/sections/Sectors";
import { ContactSection } from "@/components/sections/ContactSection";
import { getSiteImage } from "@/lib/siteImages";

export const metadata: Metadata = {
  title: "Sectors",
  description:
    "STRATIQ Access specializes in Energy, Infrastructure, Construction, Healthcare, ICT, Security, and Logistics across the Iraqi market.",
};

export default async function SectorsPage() {
  const heroImage = await getSiteImage("sectors_hero", "/images/photo-baghdad-tigris.jpg");

  return (
    <>
      <PageHero title="Our Sectors" image={heroImage} />

      <Sectors />
      <ContactSection />
    </>
  );
}
