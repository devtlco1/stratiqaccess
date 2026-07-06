import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = { title: "Privacy Policy — STRATIQ Access" };

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const tContact = await getTranslations("contact");

  return (
    <>
      <PageHero eyebrow={t("eyebrow")} title={t("privacy.title")} />
      <Section>
        <div className="mx-auto max-w-3xl space-y-6 text-[15px] leading-relaxed text-muted-500">
          <p>{t("privacy.body1")}</p>
          <p>{t("privacy.body2")}</p>
          <p>
            {t("privacy.body3Before")}{" "}
            <Link href="/legal/confidentiality" className="text-gold-300 underline underline-offset-4">
              {t("confidentiality.title")}
            </Link>{" "}
            {t("privacy.body3After")}
          </p>
          <p>
            {t("privacy.body4")} {tContact("email")}.
          </p>
        </div>
      </Section>
    </>
  );
}
