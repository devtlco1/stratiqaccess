import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
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
  const report = await getReport(slug);

  if (!report) notFound();

  return (
    <>
      <PageHero eyebrow="Report" title={report.title} description={report.description ?? undefined} />
      <Section>
        <div className="mx-auto max-w-xl border border-white/10 bg-navy-900/50 p-8 text-center">
          <p className="font-display text-3xl text-gold-400">
            {report.currency} {Number(report.price).toFixed(2)}
          </p>
          <div className="mt-6">
            <PurchaseButton reportId={report.id} label="Purchase Report" />
          </div>
        </div>
      </Section>
    </>
  );
}
