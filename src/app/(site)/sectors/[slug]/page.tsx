import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SectorRow } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ContactSection } from "@/components/sections/ContactSection";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("sectors").select("title, description").eq("slug", slug).single();
  if (!data) return {};
  return { title: data.title, description: data.description };
}

export default async function SectorDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("sectors").select("*").eq("slug", slug).single();
  const sector = data as SectorRow | null;
  if (!sector) notFound();

  return (
    <>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-white">
        <Container>
          <Link
            href="/sectors"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stratiq-blue hover:text-navy transition-colors"
          >
            <Icon name="arrow-right" className="size-4 rotate-180" />
            All Sectors
          </Link>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <div>
              <span className="inline-flex size-14 items-center justify-center rounded-xl bg-stratiq-blue/10 text-stratiq-blue">
                <Icon name={sector.icon as IconName} className="size-7" />
              </span>
              <h1 className="mt-6 font-display text-4xl sm:text-5xl text-navy leading-tight">
                {sector.title} Sector in Iraq
              </h1>

              <div className="mt-6 flex flex-col gap-4">
                {sector.body.map((paragraph, i) => (
                  <p key={i} className="text-base sm:text-lg text-ink/75 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <h2 className="mt-10 font-display text-xl text-navy">
                Our {sector.title} Services Include
              </h2>
              <ul className="mt-5 flex flex-col gap-4">
                {sector.highlights.map((highlight) => (
                  <li key={highlight.title} className="flex gap-3">
                    <Icon name="arrow-right" className="mt-1.5 size-3.5 shrink-0 rotate-45 text-stratiq-blue" />
                    <p className="text-base text-ink/80 leading-relaxed">
                      <span className="font-semibold text-navy">{highlight.title}</span>:{" "}
                      {highlight.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative aspect-4/3 rounded-2xl overflow-hidden">
              {sector.image_url && (
                <Image src={sector.image_url} alt={sector.title} fill className="object-cover" />
              )}
            </div>
          </div>
        </Container>
      </section>

      <ContactSection />
    </>
  );
}
