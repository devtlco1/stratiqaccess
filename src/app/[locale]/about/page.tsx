import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeIn } from "@/components/ui/FadeIn";
import { CTASection } from "@/components/site/CTASection";

export const metadata: Metadata = {
  title: "About — STRATIQ Access",
  description:
    "STRATIQ Access is a premium Iraq access platform operated by Abraj Al-Anwar, built on discretion, intelligence, and execution.",
};

const values = [
  { title: "Discretion", body: "Sensitive opportunities, buyer relationships, and commercial terms are protected at every stage of engagement." },
  { title: "Intelligence", body: "Decisions are grounded in structured local market and tender intelligence, not assumption." },
  { title: "Execution", body: "Engagements are governed by clear mandates and carried through to a defined outcome." },
  { title: "Compliance", body: "All activity operates within Iraqi law under a registered commercial structure." },
];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero
        eyebrow="About"
        title="A premium Iraq access platform, built on a registered commercial foundation."
        description="STRATIQ Access exists to give international companies a structured, credible, and protected route into the Iraqi market."
      />

      <Section>
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
          <FadeIn>
            <SectionHeading
              eyebrow="Company Overview"
              title="An institutional interface between international companies and the Iraqi market."
            />
            <p className="mt-5 text-[15px] leading-relaxed text-muted-500">
              STRATIQ Access was built to answer a specific gap: international companies entering Iraq need more
              than a local contact — they need a structured platform that can qualify opportunities, coordinate
              representation, support procurement, and protect their commercial interests throughout the
              engagement.
            </p>
            <p className="mt-5 text-[15px] leading-relaxed text-muted-500">
              We operate as a dedicated commercial division with a registered legal and contracting base in Iraq,
              giving international partners a credible institutional counterpart rather than an informal
              intermediary.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <SectionHeading
              eyebrow="Our Iraq Access Model"
              title="Local insight, delivered through an international-standard process."
            />
            <p className="mt-5 text-[15px] leading-relaxed text-muted-500">
              Every engagement follows a structured model: initial review, opportunity mapping, formal engagement
              structure, and execution support. Nothing moves forward without a clear mandate and agreement in
              place.
            </p>
            <p className="mt-5 text-[15px] leading-relaxed text-muted-500">
              This discipline is what allows STRATIQ Access to work across sensitive sectors — energy, ICT,
              government procurement — without compromising the confidentiality of any party involved.
            </p>
          </FadeIn>
        </div>
      </Section>

      <Section className="border-t border-white/5 bg-navy-900/30">
        <SectionHeading
          eyebrow="Our Values"
          title="What governs every engagement."
          align="center"
          className="mx-auto mb-16"
        />
        <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <FadeIn key={v.title} delay={i * 0.05} className="bg-navy-950 p-8">
              <h3 className="text-lg font-semibold text-gold-400">{v.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-500">{v.body}</p>
            </FadeIn>
          ))}
        </div>
      </Section>

      <Section>
        <FadeIn className="mx-auto max-w-3xl border border-white/10 bg-navy-900/50 p-10 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-400">Legal Operating Structure</p>
          <p className="mt-5 text-[15px] leading-relaxed text-muted-500">
            STRATIQ Access is a commercial division operated by Abraj Al-Anwar for General Trading, General
            Contracting &amp; Commercial Agencies LLC, Iraq. All engagements, representation mandates, advisory
            services, tender intelligence support, and commercial coordination activities are subject to written
            agreement, applicable Iraqi laws, and appropriate confidentiality and non-circumvention protections.
          </p>
        </FadeIn>
      </Section>

      <CTASection
        title="Ready to explore Iraq with structure and confidence?"
        body="Contact STRATIQ Access to request a confidential market-access discussion."
        button="Request a Confidential Discussion"
      />
    </>
  );
}
