import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { Services } from "@/components/sections/Services";
import { ContactSection } from "@/components/sections/ContactSection";
import { Container } from "@/components/ui/Container";
import { getSiteImage } from "@/lib/siteImages";
import { buildAlternates } from "@/i18n/alternates";
import { buildOpenGraph, buildBreadcrumbList, buildFAQSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/config";
import { serviceIndexSectionKeys, serviceIndexFaqKeys } from "@/data/servicesIndex";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.services" });
  const loc = locale as Locale;
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates("/services", loc),
    ...buildOpenGraph({ title: t("title"), description: t("description"), path: "/services", locale: loc }),
  };
}

export default async function ServicesPage({ params }: Props) {
  const { locale } = await params;
  const loc = locale as Locale;
  const heroImage = await getSiteImage("services_hero", "/images/photo-covered-market.jpg");
  const t = await getTranslations("seo.services");
  const tNav = await getTranslations("navigation");
  const tIndex = await getTranslations("services.index");

  const faqItems = serviceIndexFaqKeys.map((key) => ({
    question: tIndex(`faq.${key}.question`),
    answer: tIndex(`faq.${key}.answer`),
  }));

  return (
    <>
      <JsonLd
        data={buildBreadcrumbList([{ name: t("heroTitle"), path: "/services" }], loc, tNav("home"))}
      />
      <JsonLd data={buildFAQSchema(faqItems)} />
      <PageHero title={t("heroTitle")} image={heroImage} />

      <section className="bg-white pb-4">
        <Container className="max-w-4xl">
          <p className="text-base sm:text-lg text-ink/75 leading-relaxed text-center">
            {tIndex("intro")}
          </p>
        </Container>
      </section>

      <Services />

      <section className="bg-white py-24 lg:py-32">
        <Container className="max-w-4xl">
          <div className="flex flex-col gap-14">
            {serviceIndexSectionKeys.map((key) => (
              <div key={key}>
                <h2 className="font-display text-2xl sm:text-3xl text-navy leading-snug">
                  {tIndex(`sections.${key}.title`)}
                </h2>
                <p className="mt-4 text-base sm:text-lg text-ink/75 leading-relaxed">
                  {tIndex(`sections.${key}.body`)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 border-t border-navy/10 pt-14">
            <h2 className="font-display text-2xl sm:text-3xl text-navy leading-snug">
              {tIndex("faqHeading")}
            </h2>
            <dl className="mt-8 flex flex-col gap-8">
              {faqItems.map((item) => (
                <div key={item.question}>
                  <dt className="font-semibold text-navy text-base sm:text-lg">{item.question}</dt>
                  <dd className="mt-2 text-base text-ink/75 leading-relaxed">{item.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <ContactSection />
    </>
  );
}
