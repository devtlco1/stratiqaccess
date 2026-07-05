import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import en from "@/messages/en.json";

export const metadata: Metadata = { title: "Privacy Policy — STRATIQ Access" };

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" />
      <Section>
        <div className="mx-auto max-w-3xl space-y-6 text-sm leading-relaxed text-silver-300">
          <p>
            STRATIQ Access, a commercial division operated by Abraj Al-Anwar for General Trading, General
            Contracting &amp; Commercial Agencies LLC, Iraq, collects the information submitted through this
            website's inquiry, contact, and access-request forms solely to evaluate and respond to your request.
          </p>
          <p>
            Information you provide — company name, contact details, sector, and message content — is stored
            securely and accessible only to authorized STRATIQ Access personnel. We do not sell or share your
            information with third parties outside the scope of the engagement you request.
          </p>
          <p>
            Sensitive commercial information disclosed to us during an engagement is handled under the
            confidentiality and non-circumvention terms described on our{" "}
            <a href="/legal/confidentiality" className="text-gold-400 underline underline-offset-4">
              Confidentiality &amp; Protection
            </a>{" "}
            page.
          </p>
          <p>
            To request access to, correction of, or deletion of your data, contact {en.contact.email}.
          </p>
        </div>
      </Section>
    </>
  );
}
