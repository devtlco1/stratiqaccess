import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { CTASection } from "@/components/site/CTASection";
import { FadeIn } from "@/components/ui/FadeIn";
import en from "@/messages/en.json";

export const metadata: Metadata = {
  title: "Services — STRATIQ Access",
  description:
    "Market Entry Advisory, Tender Intelligence, Local Representation, Procurement & Sourcing Support, Partnership & JV Development, and Delegation & Meeting Support.",
};

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero
        eyebrow={en.services.hero.eyebrow}
        title={en.services.hero.title}
        description={en.services.hero.description}
      />

      <Section>
        <div className="space-y-px overflow-hidden border border-white/10 bg-white/10">
          {en.services.items.map((service, i) => (
            <FadeIn key={service.slug} delay={i * 0.04}>
              <div
                id={service.slug}
                className="scroll-mt-24 grid gap-6 bg-navy-950 p-8 lg:grid-cols-12 lg:gap-10 lg:p-12"
              >
                <div className="lg:col-span-2">
                  <span className="font-display text-3xl text-gold-500/50">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="lg:col-span-4">
                  <h2 className="font-display text-2xl text-silver-100">
                    {service.title}
                  </h2>
                </div>
                <div className="lg:col-span-6">
                  <p className="text-sm leading-relaxed text-silver-300">
                    {service.summary}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <CTASection
        title="Not sure which service fits your objective?"
        body="Tell us about your company and we will recommend the right engagement structure."
        button="Request Market Access Support"
      />
    </>
  );
}
