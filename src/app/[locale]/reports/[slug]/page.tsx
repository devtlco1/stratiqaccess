import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { PurchaseButton } from "@/components/site/PurchaseButton";
import { createClient } from "@/lib/supabase/server";

async function getReport(slug: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reports")
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

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("reports");
  const report = await getReport(slug);

  if (!report) notFound();

  return (
    <>
      <PageHero eyebrow={t("detail.eyebrow")} title={report.title} description={report.description ?? undefined} />
      <Section>
        <div className="glass-panel mx-auto max-w-xl rounded-xl p-8 text-center">
          <p className="text-gradient-gold font-display text-3xl">
            {report.currency} {Number(report.price).toFixed(2)}
          </p>
          <div className="mt-6">
            <PurchaseButton reportId={report.id} label={t("purchaseButton")} />
          </div>
        </div>
      </Section>
    </>
  );
}
