import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { FadeIn } from "@/components/ui/FadeIn";
import en from "@/messages/en.json";

export const metadata: Metadata = { title: "Confidentiality & Protection — STRATIQ Access" };

export default async function ConfidentialityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero eyebrow="Legal" title={en.legal.confidentiality.title} description={en.legal.confidentiality.intro} />
      <Section>
        <div className="space-y-8">
          {en.legal.confidentiality.items.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.05} className="border border-white/10 bg-navy-900/50 p-8">
              <h2 className="text-lg font-semibold text-ivory-100">{item.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-500">{item.body}</p>
            </FadeIn>
          ))}
        </div>
      </Section>
    </>
  );
}
