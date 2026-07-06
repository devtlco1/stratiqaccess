import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Insights — STRATIQ Access",
  description: "Iraq tender updates, energy market briefs, and infrastructure notes.",
};

async function getArticles() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("slug, title, excerpt, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function InsightsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("insights");
  const articles = await getArticles();

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <Section>
        {articles.length === 0 ? (
          <p className="text-sm text-silver-300">{t("empty")}</p>
        ) : (
          <div className="grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, i) => (
              <FadeIn key={article.slug} delay={i * 0.04}>
                <Link
                  href={`/insights/${article.slug}`}
                  className="block h-full bg-navy-950 p-8 transition-colors hover:bg-navy-900"
                >
                  <h2 className="text-lg font-semibold text-ivory-100">{article.title}</h2>
                  {article.excerpt && (
                    <p className="mt-3 text-[15px] leading-relaxed text-muted-500">
                      {article.excerpt}
                    </p>
                  )}
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
