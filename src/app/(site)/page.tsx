import { Hero } from "@/components/sections/Hero";
import { MarketOverview } from "@/components/sections/MarketOverview";
import { Services } from "@/components/sections/Services";
import { OurClients } from "@/components/sections/OurClients";
import { ContactSection } from "@/components/sections/ContactSection";

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
