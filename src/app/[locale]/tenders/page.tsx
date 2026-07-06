import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { ConfidentialityNotice } from "@/components/site/ConfidentialityNotice";
import { TendersTable } from "@/components/site/TendersTable";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Iraq Tenders — STRATIQ Access",
  description: "Qualified opportunities across Iraq's strategic sectors.",
};

async function getOpportunities() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("opportunities")
      .select(
        "id, kind, title, buyer, location, country, deadline, status, tender_type, reference_no, ownership, procurement_type, published_at, requires_nda",
      )
      .eq("content_status", "published")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function TendersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("tenders");
  const opportunities = await getOpportunities();

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <Section>
        <div className="mb-10">
          <ConfidentialityNotice text={t("gatedNotice")} />
        </div>

        {opportunities.length === 0 ? (
          <p className="text-[15px] text-muted-500">{t("empty")}</p>
        ) : (
          <TendersTable items={opportunities} />
        )}
      </Section>
    </>
  );
}
