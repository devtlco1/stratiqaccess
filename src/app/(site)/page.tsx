import { Hero } from "@/components/sections/Hero";
import { MarketOverview } from "@/components/sections/MarketOverview";
import { Services } from "@/components/sections/Services";
import { Sectors } from "@/components/sections/Sectors";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { Insights } from "@/components/sections/Insights";
import { ContactSection } from "@/components/sections/ContactSection";

export default function Home() {
  return (
    <>
      <Hero />
      <MarketOverview />
      <Services />
      <Sectors />
      <CaseStudies />
      <Insights />
      <ContactSection />
    </>
  );
}
