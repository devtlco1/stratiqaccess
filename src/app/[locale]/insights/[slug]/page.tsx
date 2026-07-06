import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { createClient } from "@/lib/supabase/server";

async function getArticle(slug: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("insights");
  const article = await getArticle(slug);

  if (!article) notFound();

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={article.title} description={article.excerpt ?? undefined} />
      <Section>
        <div className="mx-auto max-w-3xl whitespace-pre-line text-[15px] leading-relaxed text-muted-500">
          {article.body}
        </div>
      </Section>
    </>
  );
}
