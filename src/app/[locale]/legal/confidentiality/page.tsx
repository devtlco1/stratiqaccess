import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = { title: "Confidentiality & Protection — STRATIQ Access" };

type ConfidentialityItem = { title: string; body: string };

export default async function ConfidentialityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const items = t.raw("confidentiality.items") as ConfidentialityItem[];

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("confidentiality.title")} description={t("confidentiality.intro")} />
      <Section>
        <div className="space-y-8">
          {items.map((item, i) => (
            <FadeIn key={item.title} delay={i * 0.05} className="glass-panel rounded-xl p-8">
              <h2 className="text-lg font-semibold text-ivory-100">{item.title}</h2>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-500">{item.body}</p>
            </FadeIn>
          ))}
        </div>
      </Section>
    </>
  );
}
