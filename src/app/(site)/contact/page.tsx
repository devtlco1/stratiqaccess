import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { ContactSection } from "@/components/sections/ContactSection";
import { getSiteImage } from "@/lib/siteImages";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell STRATIQ Access what you need on the ground in Iraq — accommodation, transport, staffing, permits, legal coordination, or full field execution.",
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
