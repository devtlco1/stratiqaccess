import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { CTASection } from "@/components/site/CTASection";
import { FadeIn } from "@/components/ui/FadeIn";
import en from "@/messages/en.json";

export const metadata: Metadata = {
  title: "Iraq Market Access — STRATIQ Access",
  description:
    "How international companies enter the Iraqi market: local partner models, tender registration, opportunity mapping, and representation safeguards.",
};

export default async function IraqMarketAccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero
        eyebrow={en.iraqMarketAccess.hero.eyebrow}
        title={en.iraqMarketAccess.hero.title}
        description={en.iraqMarketAccess.hero.description}
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-2">
          {en.iraqMarketAccess.sections.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.05}>
              <div className="h-full border border-white/10 bg-navy-900/50 p-8">
                <h2 className="text-xl font-semibold text-ivory-100">{s.title}</h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted-500">{s.body}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <CTASection
        title="Planning to enter the Iraqi market?"
        body="Request a confidential review of the right entry model for your company."
        button="Request Market Access Support"
      />
    </>
  );
}
