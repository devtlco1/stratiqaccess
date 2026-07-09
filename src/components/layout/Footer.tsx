import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { siteConfig } from "@/data/siteConfig";
import { createPublicClient } from "@/lib/supabase/public";
import type { SiteSettingsRow } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";

const FOOTER_LINKS = [
  { key: "services", href: "/services" },
  { key: "sectors", href: "/sectors" },
  { key: "caseStudies", href: "/case-studies" },
  { key: "insights", href: "/insights" },
  { key: "clients", href: "/clients" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
] as const;

export async function Footer() {
  const supabase = createPublicClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  const settings = data as SiteSettingsRow | null;
  const email = settings?.email || siteConfig.email;
  const t = await getTranslations("footer");
  const locale = (await getLocale()) as Locale;

  return (
    <footer className="bg-navy text-white/70">
      {/* Forced ltr: the logo must stay on the same physical side regardless
          of locale — the text block re-asserts its own direction below. */}
      <Container dir="ltr" className="py-20 flex flex-col sm:flex-row sm:items-start gap-10 sm:gap-20">
        <Image
          src={siteConfig.logo.light}
          alt={siteConfig.name}
          width={898}
          height={240}
          className="h-9 w-auto"
        />

        <div dir={locale === "ar" ? "rtl" : "ltr"}>
          <h3 className="font-display text-lg text-white">{t("emailHeading")}</h3>
          <p className="mt-2 text-sm">{t("emailPrompt")}</p>
          <a
            href={`mailto:${email}`}
            className="group mt-1 inline-block text-sm text-stratiq-blue hover:text-white transition-colors"
          >
            <span className="border-b border-transparent group-hover:border-white/60 transition-colors">
              {email}
            </span>
          </a>
        </div>

        <nav
          dir={locale === "ar" ? "rtl" : "ltr"}
          aria-label={t("linksHeading")}
          className="sm:ms-auto"
        >
          <h3 className="font-display text-lg text-white">{t("linksHeading")}</h3>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 sm:flex-col sm:gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.key}>
                <Link href={link.href} className="text-sm hover:text-white transition-colors">
                  {t(`links.${link.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>

      <div className="border-t border-white/10">
        <Container className="py-6 text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. {t("rightsReserved")}
          </p>
          <p dir={locale === "ar" ? "rtl" : "ltr"} className="mt-2 max-w-2xl text-[11px] leading-relaxed text-white/40">
            {t("legalNotice")}
          </p>
        </Container>
      </div>
    </footer>
  );
}
