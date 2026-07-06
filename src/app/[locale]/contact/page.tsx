import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { ContactForm } from "@/components/site/ContactForm";

export const metadata: Metadata = {
  title: "Contact — STRATIQ Access",
  description: "Request a confidential market-access discussion with STRATIQ Access.",
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const tBrand = await getTranslations("brand");
  const interests = t.raw("interests") as string[];
  const formLabels = t.raw("form") as {
    companyName: string;
    contactPerson: string;
    email: string;
    country: string;
    sector: string;
    interest: string;
    message: string;
    submit: string;
    success: string;
    error: string;
  };

  return (
    <>
      <PageHero
        eyebrow={t("hero.eyebrow")}
        title={t("hero.title")}
        description={t("hero.description")}
      />

      <Section>
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ContactForm
              interests={interests}
              labels={formLabels}
              successMessage={formLabels.success}
              errorMessage={formLabels.error}
              submitLabel={formLabels.submit}
            />
          </div>
          <div className="lg:col-span-5">
            <div className="glass-panel rounded-lg p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-400">{t("directContactLabel")}</p>
              <p className="mt-4 text-lg text-ivory-100">{t("email")}</p>
              <div className="divider-line mt-8" />
              <p className="mt-8 text-[15px] leading-relaxed text-muted-500">
                {tBrand("legalFooterExtended")}
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
