import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { MarketOverview } from "@/components/sections/MarketOverview";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSiteImage } from "@/lib/siteImages";

export const metadata: Metadata = {
  title: "About",
  description:
    "STRATIQ Access is an Iraq-based advisory and representation platform helping global companies enter and grow in the Iraqi market.",
};

// EDIT ME: keep these honest — no fabricated history or headcount, only verifiable facts
const stats = [
  { value: "8", label: "Sectors Covered" },
  { value: "8", label: "Advisory Services" },
  { value: "100%", label: "Iraq-Focused" },
  { value: "1", label: "Dedicated Local Partner" },
];

const approach = [
  {
    step: "01",
    title: "Understand",
    description:
      "We start by mapping your objectives against Iraq's regulatory, commercial, and political landscape.",
  },
  {
    step: "02",
    title: "Structure",
    description:
      "We design a market entry, tender, or partnership strategy built around realistic timelines and verified opportunity.",
  },
  {
    step: "03",
    title: "Execute",
    description:
      "We stay engaged through implementation — representation, negotiation, and government liaison included.",
  },
];

export default async function AboutPage() {
  const heroImage = await getSiteImage("about_hero", "/images/photo-construction-iraq.jpg");

  return (
    <>
      <PageHero title="About" image={heroImage} />

      <MarketOverview />

      <section className="py-20 bg-white">
        <Container>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-4xl sm:text-5xl font-bold text-stratiq-blue">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-ink/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 lg:py-32 bg-navy">
        <Container>
          <SectionHeading
            eyebrow="How We Work"
            title="A disciplined, three-stage approach"
            tone="light"
          />

          <div className="mt-16 grid sm:grid-cols-3 gap-8">
            {approach.map((item) => (
              <div key={item.step} className="rounded-2xl bg-white/5 border border-white/10 p-8">
                <span className="font-display text-4xl text-stratiq-blue">{item.step}</span>
                <h3 className="mt-4 font-display text-xl text-white">{item.title}</h3>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
