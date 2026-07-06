import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/ui/FadeIn";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Reports — STRATIQ Access",
  description: "Paid tender advisory and market-entry reports for Iraq.",
};

async function getReports() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("reports")
      .select("id, slug, title, description, price, currency")
      .eq("status", "published")
      .order("featured", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function ReportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("reports");
  const reports = await getReports();

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <Section>
        {reports.length === 0 ? (
          <p className="text-sm text-muted-500">{t("empty")}</p>
        ) : (
          <div className="grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {reports.map((report, i) => (
              <FadeIn key={report.id} delay={i * 0.05}>
                <Link
                  href={`/reports/${report.slug}`}
                  className="block h-full bg-navy-950 p-8 transition-colors hover:bg-navy-900/60"
                >
                  <h2 className="text-lg font-semibold text-ivory-100">{report.title}</h2>
                  {report.description && (
                    <p className="mt-3 text-[15px] leading-relaxed text-muted-500">{report.description}</p>
                  )}
                  <p className="text-gradient-gold mt-6 text-sm font-semibold">
                    {report.currency} {Number(report.price).toFixed(2)}
                  </p>
                </Link>
              </FadeIn>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
