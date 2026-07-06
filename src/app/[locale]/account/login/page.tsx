import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageHero } from "@/components/site/PageHero";
import { Section } from "@/components/site/Section";
import { AccountAuthForm } from "@/components/site/AccountAuthForm";

export const metadata = { title: "Client Login — STRATIQ Access" };

export default async function AccountLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const { next } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("account");

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("login.title")} />
      <Section>
        <div className="mx-auto max-w-sm">
          <AccountAuthForm mode="login" next={next} />
          <p className="mt-6 text-center text-sm text-silver-400">
            {t("login.noAccountText")}{" "}
            <Link href="/account/signup" className="text-cyan-300 hover:text-cyan-200">
              {t("login.createOneLink")}
            </Link>
          </p>
        </div>
      </Section>
    </>
  );
}
