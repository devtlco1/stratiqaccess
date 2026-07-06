import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";

export const metadata: Metadata = { title: "Terms of Use — STRATIQ Access" };

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const tBrand = await getTranslations("brand");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("terms.title")} />
      <Section>
        <div className="mx-auto max-w-3xl space-y-6 text-[15px] leading-relaxed text-muted-500">
          <p>{tBrand("legalFooterExtended")}</p>
          <p>{t("terms.body1")}</p>
          <p>{t("terms.body2")}</p>
          <p>{t("terms.body3")}</p>
        </div>
      </Section>
    </>
  );
}
