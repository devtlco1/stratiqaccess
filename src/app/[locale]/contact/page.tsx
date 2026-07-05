import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { ContactForm } from "@/components/site/ContactForm";
import en from "@/messages/en.json";

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

  return (
    <>
      <PageHero
        eyebrow={en.contact.hero.eyebrow}
        title={en.contact.hero.title}
        description={en.contact.hero.description}
      />

      <Section>
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ContactForm
              interests={en.contact.interests}
              labels={en.contact.form}
              successMessage={en.contact.form.success}
              errorMessage={en.contact.form.error}
              submitLabel={en.contact.form.submit}
            />
          </div>
          <div className="lg:col-span-5">
            <div className="border border-white/10 bg-navy-900/50 p-8">
              <p className="text-xs uppercase tracking-[0.2em] text-gold-400">Direct Contact</p>
              <p className="mt-4 text-lg text-silver-100">{en.contact.email}</p>
              <div className="mt-8 divider-gold" />
              <p className="mt-8 text-[15px] leading-relaxed text-muted-500">
                {en.brand.legalFooterExtended}
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
