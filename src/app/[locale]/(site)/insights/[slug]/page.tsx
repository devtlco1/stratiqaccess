import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import type { InsightRow } from "@/lib/types";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { ContactSection } from "@/components/sections/ContactSection";
import { buildAlternates } from "@/i18n/alternates";
import { buildOpenGraph, buildBreadcrumbList, buildArticleSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/i18n/config";
import { pickText, pickList } from "@/lib/localizedContent";

type Props = { params: Promise<{ locale: string; slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("insights")
    .select("title, excerpt, title_ar, excerpt_ar, image_url")
    .eq("slug", slug)
    .single();
  if (!data) return {};
  const loc = locale as Locale;
  const title = pickText(loc, data.title, data.title_ar);
  const description = pickText(loc, data.excerpt, data.excerpt_ar);
  return {
    title,
    description,
    alternates: buildAlternates(`/insights/${slug}`, loc),
    ...buildOpenGraph({ title, description, path: `/insights/${slug}`, locale: loc, image: data.image_url }),
  };
}

export default async function InsightDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("insights").select("*").eq("slug", slug).single();
  const insight = data as InsightRow | null;
  if (!insight) notFound();
  const t = await getTranslations("insights");
  const tSeo = await getTranslations("seo.insights");
  const tNav = await getTranslations("navigation");
  const loc = locale as Locale;
  const title = pickText(loc, insight.title, insight.title_ar);
  const excerpt = pickText(loc, insight.excerpt, insight.excerpt_ar);
  const body = pickList(loc, insight.body, insight.body_ar);
  const publishedDate = new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(insight.published_date));

  return (
    <>
      <JsonLd
        data={buildBreadcrumbList(
          [
            { name: tSeo("heroTitle"), path: "/insights" },
            { name: title, path: `/insights/${slug}` },
          ],
          loc,
          tNav("home")
        )}
      />
      <JsonLd
        data={buildArticleSchema({
          headline: title,
          description: excerpt,
          path: `/insights/${slug}`,
          locale: loc,
          datePublished: insight.published_date,
          image: insight.image_url,
        })}
      />
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-white">
        <Container className="max-w-4xl">
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stratiq-blue hover:text-navy transition-colors"
          >
            <Icon name="arrow-right" className="size-4 rotate-180 rtl:rotate-0" />
            {t("backLink")}
          </Link>

          <div className="mt-8 relative aspect-[16/8] rounded-2xl overflow-hidden">
            {insight.image_url && (
              <Image src={insight.image_url} alt={title} fill className="object-cover" />
            )}
          </div>

          <p className="mt-6 text-xs font-semibold tracking-[0.15em] uppercase text-stratiq-blue">
            {publishedDate}
          </p>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl text-navy leading-snug">
            {title}
          </h1>

          <div className="mt-6 flex flex-col gap-4">
            {body.map((paragraph, i) => (
              <p key={i} className="text-base sm:text-lg text-ink/75 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </Container>
      </section>

      <ContactSection />
    </>
  );
}
