import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ServiceRow } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ContactSection } from "@/components/sections/ContactSection";
import { buildAlternates } from "@/i18n/alternates";
import { buildOpenGraph, buildBreadcrumbList, buildServiceSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/config";
import { pickText, pickList } from "@/lib/localizedContent";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("services")
    .select("title, description, title_ar, description_ar, image_url")
    .eq("slug", slug)
    .single();
  if (!data) return {};
  const loc = locale as Locale;
  const title = pickText(loc, data.title, data.title_ar);
  const description = pickText(loc, data.description, data.description_ar);
  return {
    title,
    description,
    alternates: buildAlternates(`/services/${slug}`, loc),
    ...buildOpenGraph({ title, description, path: `/services/${slug}`, locale: loc, image: data.image_url }),
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("services").select("*").eq("slug", slug).single();
  const service = data as ServiceRow | null;
  if (!service) notFound();
  const t = await getTranslations("services");
  const tSeo = await getTranslations("seo.services");
  const tNav = await getTranslations("navigation");
  const loc = locale as Locale;
  const title = pickText(loc, service.title, service.title_ar);
  const description = pickText(loc, service.description, service.description_ar);
  const body = pickList(loc, service.body, service.body_ar);
  const highlights = pickList(loc, service.highlights, service.highlights_ar);

  return (
    <>
      <JsonLd
        data={buildBreadcrumbList(
          [
            { name: tSeo("heroTitle"), path: "/services" },
            { name: title, path: `/services/${slug}` },
          ],
          loc,
          tNav("home")
        )}
      />
      <JsonLd
        data={buildServiceSchema({ name: title, description, path: `/services/${slug}`, locale: loc })}
      />
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-white">
        <Container>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stratiq-blue hover:text-navy transition-colors"
          >
            <Icon name="arrow-right" className="size-4 rotate-180 rtl:rotate-0" />
            {t("backLink")}
          </Link>

          <div
            className={`mt-8 grid grid-cols-1 gap-14 items-start ${
              service.image_url ? "lg:grid-cols-2" : "max-w-3xl"
            }`}
          >
            {service.image_url && (
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden lg:order-2">
                <Image
                  src={service.image_url}
                  alt={title}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            )}

            <div className="lg:order-1">
              <span className="inline-flex size-14 items-center justify-center rounded-xl bg-stratiq-blue/10 text-stratiq-blue">
                <Icon name={service.icon as IconName} className="size-7" />
              </span>
              <h1 className="mt-6 font-display text-4xl sm:text-5xl text-navy leading-tight">
                {title}
              </h1>

              <div className="mt-6 flex flex-col gap-4">
                {body.map((paragraph, i) => (
                  <p key={i} className="text-base sm:text-lg text-ink/75 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <h2 className="mt-10 font-display text-xl text-navy">{t("includesHeading")}</h2>
              <ul className="mt-5 flex flex-col gap-4">
                {highlights.map((highlight) => (
                  <li key={highlight.title} className="flex gap-3">
                    <Icon name="arrow-right" className="mt-1.5 size-3.5 shrink-0 rotate-45 rtl:-scale-x-100 text-stratiq-blue" />
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
