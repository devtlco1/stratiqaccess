import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ServiceRow } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ContactSection } from "@/components/sections/ContactSection";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("title, description").eq("slug", slug).single();
  if (!data) return {};
  return { title: data.title, description: data.description };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("*").eq("slug", slug).single();
  const service = data as ServiceRow | null;
  if (!service) notFound();

  return (
    <>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-white">
        <Container>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stratiq-blue hover:text-navy transition-colors"
          >
            <Icon name="arrow-right" className="size-4 rotate-180" />
            All Services
          </Link>

          <div
            className={`mt-8 grid grid-cols-1 gap-14 items-start ${
              service.image_url ? "lg:grid-cols-2" : "max-w-3xl"
            }`}
          >
            {service.image_url && (
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden lg:order-2">
                <Image src={service.image_url} alt={service.title} fill className="object-cover" />
              </div>
            )}

            <div className="lg:order-1">
              <span className="inline-flex size-14 items-center justify-center rounded-xl bg-stratiq-blue/10 text-stratiq-blue">
                <Icon name={service.icon as IconName} className="size-7" />
              </span>
              <h1 className="mt-6 font-display text-4xl sm:text-5xl text-navy leading-tight">
                {service.title}
              </h1>

              <div className="mt-6 flex flex-col gap-4">
                {service.body.map((paragraph, i) => (
                  <p key={i} className="text-base sm:text-lg text-ink/75 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <h2 className="mt-10 font-display text-xl text-navy">This Service Includes</h2>
              <ul className="mt-5 flex flex-col gap-4">
                {service.highlights.map((highlight) => (
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
          </div>
        </Container>
      </section>

      <ContactSection />
    </>
  );
}
