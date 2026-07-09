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
import { fallbackImageForSlug } from "@/lib/fallbackImages";
import { Pagination, PAGE_SIZE } from "@/components/ui/Pagination";
import { buildAlternates } from "@/i18n/alternates";
import { buildOpenGraph } from "@/lib/seo";
import type { Locale } from "@/i18n/config";
import { pickText, pickList } from "@/lib/localizedContent";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.caseStudies" });
  const loc = locale as Locale;
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates("/case-studies", loc),
    ...buildOpenGraph({ title: t("title"), description: t("description"), path: "/case-studies", locale: loc }),
  };
}

export default async function CaseStudiesPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const loc = locale as Locale;
  const supabase = createPublicClient();
  const { data, count } = await supabase
    .from("case_studies")
    .select("*", { count: "exact" })
    .order("sort_order", { ascending: true })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  const caseStudies = (data ?? []) as CaseStudyRow[];
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));
  const heroImage = await getSiteImage("case_studies_hero", "/images/photo-baghdad-medical-city.jpg");
  const t = await getTranslations("seo.caseStudies");

  return (
    <>
      <PageHero title={t("heroTitle")} image={heroImage} />

      <CaseStudies />

      <section className="py-24 lg:py-32 bg-white">
        <Container className="max-w-4xl">
          <div className="flex flex-col gap-20">
            {caseStudies.map((study) => {
              const title = pickText(loc, study.title, study.title_ar);
              return (
              <article key={study.id} id={study.slug} className="scroll-mt-28">
                <div className="relative aspect-[16/8] rounded-lg overflow-hidden">
                  <Image
                    src={study.image_url ?? fallbackImageForSlug(study.slug)}
                    alt={title}
                    fill
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <span className="mt-6 inline-block text-xs font-semibold tracking-[0.15em] uppercase text-stratiq-blue">
                  {pickText(loc, study.sector, study.sector_ar)}
                </span>
                <h2 className="mt-3 font-display text-2xl sm:text-3xl text-navy leading-snug">
                  {title}
                </h2>
                <div className="mt-6 flex flex-col gap-4">
                  {pickList(loc, study.body, study.body_ar).map((paragraph, i) => (
                    <p key={i} className="text-base text-ink/75 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
              );
            })}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} basePath="/case-studies" />
        </Container>
      </section>

      <ContactSection />
    </>
  );
}
