import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { ContactSection } from "@/components/sections/ContactSection";
import { getSiteImage } from "@/lib/siteImages";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with STRATIQ Access to discuss your Iraq market entry, tender, or partnership objectives.",
};

export default async function ContactPage() {
  const heroImage = await getSiteImage("contact_hero", "/images/photo-baghdad-tigris.jpg");

  return (
    <>
      <PageHero title="Contact Us" image={heroImage} />

      <ContactSection />
    </>
  );
}
