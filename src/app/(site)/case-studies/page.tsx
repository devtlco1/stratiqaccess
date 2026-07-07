import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/sections/PageHero";
import { CaseStudies } from "@/components/sections/CaseStudies";
import { ContactSection } from "@/components/sections/ContactSection";
import { Container } from "@/components/ui/Container";
import { createClient } from "@/lib/supabase/server";
import type { CaseStudyRow } from "@/lib/types";
import { getSiteImage } from "@/lib/siteImages";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "How STRATIQ Access has helped companies identify opportunities, structure partnerships, and enter the Iraqi market with confidence.",
};

export default async function CaseStudiesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("case_studies")
    .select("*")
    .order("sort_order", { ascending: true });
  const caseStudies = (data ?? []) as CaseStudyRow[];
  const heroImage = await getSiteImage("case_studies_hero", "/images/photo-baghdad-medical-city.jpg");

  return (
    <>
      <PageHero title="Case Studies" image={heroImage} />

      <CaseStudies />

      <section className="py-24 lg:py-32 bg-white">
        <Container className="max-w-4xl">
          <div className="flex flex-col gap-20">
            {caseStudies.map((study) => (
              <article key={study.id} id={study.slug} className="scroll-mt-28">
                <div className="relative aspect-[16/8] rounded-lg overflow-hidden">
                  {study.image_url && (
                    <Image src={study.image_url} alt={study.title} fill className="object-cover" />
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
