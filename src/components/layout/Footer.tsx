import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { siteConfig } from "@/data/siteConfig";
import { createPublicClient } from "@/lib/supabase/public";
import type { ServiceRow, SiteSettingsRow } from "@/lib/types";
import type { Locale } from "@/i18n/config";
import { Container } from "@/components/ui/Container";
import { Link } from "@/i18n/navigation";
import { pickText } from "@/lib/localizedContent";

type FooterLink = { href: string; label: string };

function FooterColumn({ heading, links, dir }: { heading: string; links: FooterLink[]; dir: "ltr" | "rtl" }) {
  return (
    <nav dir={dir} aria-label={heading}>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-white">{heading}</h3>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export async function Footer() {
  const supabase = createPublicClient();
  const [{ data: settingsData }, { data: servicesData }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase
      .from("services")
      .select("slug, title, title_ar")
      .eq("is_featured", true)
      .order("sort_order", { ascending: true })
      .limit(6),
  ]);
  const settings = settingsData as SiteSettingsRow | null;
  const email = settings?.email || siteConfig.email;
  const featuredServices = (servicesData ?? []) as Pick<ServiceRow, "slug" | "title" | "title_ar">[];

  const t = await getTranslations("footer");
  const tServices = await getTranslations("services.index");
  const locale = (await getLocale()) as Locale;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const sitemapLinks: FooterLink[] = [
    { href: "/", label: t("links.home") },
    { href: "/services", label: t("links.services") },
    { href: "/clients", label: t("links.clients") },
    { href: "/about", label: t("links.about") },
    { href: "/contact", label: t("links.contact") },
  ];

  const servicesLinks: FooterLink[] = [
    ...featuredServices.map((service) => ({
      href: `/services/${service.slug}`,
      label: pickText(locale, service.title, service.title_ar),
    })),
    { href: "/services", label: tServices("viewAll") },
  ];

  const exploreLinks: FooterLink[] = [
    { href: "/sectors", label: t("links.sectors") },
    { href: "/case-studies", label: t("links.caseStudies") },
    { href: "/insights", label: t("links.insights") },
    { href: "/contact", label: t("links.contact") },
  ];

  return (
    <footer className="bg-navy text-white/70">
      {/* Forced ltr: column order (and the logo within it) must stay physically
          fixed regardless of locale — each column re-asserts its own text
          direction internally so Arabic content still reads correctly. */}
      <Container dir="ltr" className="py-10 lg:py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
        <div className="sm:col-span-2 lg:col-span-1">
          <Image
            src={siteConfig.logo.light}
            alt={siteConfig.name}
            width={898}
            height={240}
            className="h-8 w-auto"
          />
          <p dir={dir} className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            {t("brandDescription")}
          </p>
          <a
            href={`mailto:${email}`}
            className="group mt-3 inline-block text-sm text-stratiq-blue hover:text-white transition-colors"
          >
            <span className="border-b border-transparent group-hover:border-white/60 transition-colors">
              {email}
            </span>
          </a>
        </div>

        <FooterColumn heading={t("sitemapHeading")} links={sitemapLinks} dir={dir} />
        <FooterColumn heading={t("servicesHeading")} links={servicesLinks} dir={dir} />
        <FooterColumn heading={t("exploreHeading")} links={exploreLinks} dir={dir} />
      </Container>

      <div className="border-t border-white/10">
        <Container className="py-5 text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. {t("rightsReserved")}
          </p>
          <p dir={dir} className="mt-1.5 max-w-2xl text-[11px] leading-relaxed text-white/40">
            {t("legalNotice")}
          </p>
        </Container>
      </div>
    </footer>
  );
}
