import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { OurClients } from "@/components/sections/OurClients";
import { ContactSection } from "@/components/sections/ContactSection";
import { getSiteImage } from "@/lib/siteImages";

export const metadata: Metadata = {
  title: "Clients",
  description:
    "Companies and organizations that trust STRATIQ Access for ground operations, logistics, and local support across Iraq.",
};

export default async function ClientsPage() {
  const heroImage = await getSiteImage("clients_hero", "/images/photo-baghdad-2023.jpg");

  return (
    <>
      <PageHero title="Clients" image={heroImage} />

      <OurClients showWhenEmpty />
      <ContactSection />
    </>
  );
}
