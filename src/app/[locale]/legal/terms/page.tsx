import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import en from "@/messages/en.json";

export const metadata: Metadata = { title: "Terms of Use — STRATIQ Access" };

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero eyebrow="Legal" title="Terms of Use" />
      <Section>
        <div className="mx-auto max-w-3xl space-y-6 text-sm leading-relaxed text-silver-300">
          <p>{en.brand.legalFooterExtended}</p>
          <p>
            Use of this website does not, by itself, create a representation, advisory, or partnership
            relationship with STRATIQ Access. Such relationships are formed only through a signed mandate or
            agreement, as described under our engagement model.
          </p>
          <p>
            Opportunity listings, market intelligence, and sector information published on this site are
            provided for general orientation only and do not constitute a binding offer, guarantee of award, or
            legal or financial advice.
          </p>
          <p>
            All content on this website is the property of STRATIQ Access / Abraj Al-Anwar unless otherwise
            noted, and may not be reproduced without written permission.
          </p>
        </div>
      </Section>
    </>
  );
}
