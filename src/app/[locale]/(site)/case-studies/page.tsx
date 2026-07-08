import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { ContactSection } from "@/components/sections/ContactSection";
import { Container } from "@/components/ui/Container";
import { createPublicClient } from "@/lib/supabase/public";
import type { CaseStudyRow } from "@/lib/types";
import { getSiteImage } from "@/lib/siteImages";
import { buildAlternates } from "@/i18n/alternates";
import type { Locale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.caseStudies" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates("/case-studies", locale as Locale),
  };
}

export default async function CaseStudiesPage() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("case_studies")
    .select("*")
    .order("sort_order", { ascending: true });
  const caseStudies = (data ?? []) as CaseStudyRow[];
  const heroImage = await getSiteImage("case_studies_hero", "/images/photo-baghdad-medical-city.jpg");
  const t = await getTranslations("seo.caseStudies");

  return (
    <>
      <PageHero title={t("heroTitle")} image={heroImage} />

      <CaseStudies />

      <section className="py-24 lg:py-32 bg-white">
        <Container className="max-w-4xl">
          <div className="flex flex-col gap-20">
            {caseStudies.map((study) => (
              <article key={study.id} id={study.slug} className="scroll-mt-28">
                <div className="relative aspect-[16/8] rounded-lg overflow-hidden">
                  {study.image_url && (
                    <Image
                      src={study.image_url}
                      alt={study.title}
                      fill
                      sizes="(min-width: 1024px) 60vw, 100vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <span className="mt-6 inline-block text-xs font-semibold tracking-[0.15em] uppercase text-stratiq-blue">
                  {study.sector}
                </span>
                <h2 className="mt-3 font-display text-2xl sm:text-3xl text-navy leading-snug">
                  {study.title}
                </h2>
                <div className="mt-6 flex flex-col gap-4">
                  {study.body.map((paragraph, i) => (
                    <p key={i} className="text-base text-ink/75 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <ContactSection />
    </>
  );
}
