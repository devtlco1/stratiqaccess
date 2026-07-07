import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { MarketOverview } from "@/components/sections/MarketOverview";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSiteImage } from "@/lib/siteImages";

export const metadata: Metadata = {
  title: "About",
  description:
    "STRATIQ Access is an Iraq-based ground operations partner helping international companies execute securely and reliably on the ground in Iraq.",
};

// EDIT ME: keep these honest — no fabricated history or headcount, only verifiable facts
const stats = [
  { value: "14", label: "Ground Services" },
  { value: "100%", label: "Iraq-Focused" },
  { value: "24/7", label: "Field Support" },
  { value: "1", label: "Dedicated Local Team" },
];

const approach = [
  {
    step: "01",
    title: "Assess",
    description:
      "We map your operational needs against Iraq's security, regulatory, and logistical landscape before anyone lands.",
  },
  {
    step: "02",
    title: "Coordinate",
    description:
      "We line up the local network — accommodation, transport, staffing, permits, and legal partners — around your timeline.",
  },
  {
    step: "03",
    title: "Execute",
    description:
      "We stay on the ground through delivery, handling logistics and field support so your team can focus on the work.",
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
