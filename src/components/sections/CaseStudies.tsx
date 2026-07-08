import Image from "next/image";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";
import type { CaseStudyRow } from "@/lib/types";
import { Container } from "@/components/ui/Container";

export async function CaseStudies() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("case_studies")
    .select("*")
    .order("sort_order", { ascending: true });
  const caseStudies = (data ?? []) as CaseStudyRow[];

  return (
    <section id="case-studies" className="scroll-mt-24 py-24 lg:py-32 bg-navy">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">
          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-stratiq-blue">
              Case Studies
            </span>
            <p className="mt-5 font-display text-2xl sm:text-3xl text-white leading-snug max-w-lg">
              We help companies identify opportunities, structure partnerships, and approach the
              Iraqi market with confidence.
            </p>
          </div>
          <div className="text-left lg:text-right">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-stratiq-blue">
              Trusted
            </span>
            <h2 className="mt-2 font-display text-4xl sm:text-5xl text-white leading-tight">
              Delivered With Discipline
            </h2>
          </div>
        </div>

        <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {caseStudies.map((study) => (
            <Link
              key={study.id}
              href={`/case-studies#${study.slug}`}
              className="group relative aspect-4/3 overflow-hidden rounded-lg block shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              {study.image_url && (
                <Image
                  src={study.image_url}
                  alt={study.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/10 to-transparent" />
              <div className="absolute inset-0 flex items-end p-6">
                <h3 className="font-display text-lg text-white leading-snug">{study.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
