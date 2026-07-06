import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { CTASection } from "@/components/site/CTASection";
import { FadeIn } from "@/components/ui/FadeIn";

export const metadata: Metadata = {
  title: "Services — STRATIQ Access",
  description:
    "Market Entry Advisory, Tender Intelligence, Local Representation, Procurement & Sourcing Support, Partnership & JV Development, and Delegation & Meeting Support.",
};

type ServiceItem = { slug: string; title: string; summary: string };

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const items = t.raw("items") as ServiceItem[];

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <Section>
        <div className="space-y-px overflow-hidden rounded-xl border border-white/10 bg-white/10">
          {items.map((service, i) => (
            <FadeIn key={service.slug} delay={i * 0.04}>
              <div
                id={service.slug}
                className="scroll-mt-24 grid gap-6 bg-navy-950 p-8 transition-colors duration-300 hover:bg-navy-900/60 lg:grid-cols-12 lg:gap-10 lg:p-12"
              >
                <div className="lg:col-span-2">
                  <span className="font-display text-3xl text-cyan-400/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="lg:col-span-4">
                  <h2 className="text-2xl font-semibold text-ivory-100">
                    {service.title}
                  </h2>
                </div>
                <div className="lg:col-span-6">
                  <p className="text-[15px] leading-relaxed text-muted-500">
                    {service.summary}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </Section>

      <CTASection
        title={t("cta.title")}
        body={t("cta.body")}
        button={t("cta.button")}
      />
    </>
  );
}
