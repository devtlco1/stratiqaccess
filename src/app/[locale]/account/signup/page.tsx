import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { AccountAuthForm } from "@/components/site/AccountAuthForm";

export const metadata = { title: "Create Account — STRATIQ Access" };

export default async function AccountSignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHero eyebrow="Client Access" title="Create your STRATIQ Access account" />
      <Section>
        <div className="mx-auto max-w-sm">
          <AccountAuthForm mode="signup" />
          <p className="mt-6 text-center text-sm text-silver-400">
            Already have an account?{" "}
            <Link href="/account/login" className="text-gold-400 hover:text-gold-300">
              Sign in
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}
