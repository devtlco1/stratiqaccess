import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

type NavKey =
  | "about"
  | "services"
  | "sectors"
  | "iraqMarketAccess"
  | "tenderIntelligence"
  | "partnerships"
  | "insights"
  | "contact"
  | "cta";

const company: { href: string; key: NavKey }[] = [
  { href: "/about", key: "about" },
  { href: "/services", key: "services" },
  { href: "/sectors", key: "sectors" },
  { href: "/partnerships", key: "partnerships" },
];

const resources: { href: string; key?: NavKey | "tenders" }[] = [
  { href: "/tender-intelligence", key: "tenderIntelligence" },
  { href: "/iraq-market-access", key: "iraqMarketAccess" },
  { href: "/tenders", key: "tenders" },
  { href: "/insights", key: "insights" },
];

const legal = [
  { href: "/legal/confidentiality", key: "confidentiality" as const },
  { href: "/legal/terms", key: "terms" as const },
  { href: "/legal/privacy", key: "privacy" as const },
];

export function Footer() {
  const t = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const tBrand = useTranslations("brand");
  const tContact = useTranslations("contact");
  const tLegal = useTranslations("legal");
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-ivory-100/8 bg-navy-950">
      <div className="divider-glow absolute inset-x-0 top-0 opacity-40" />
      <Container className="py-20">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Image
              src="/brand/stratiq-wordmark.png"
              alt="STRATIQ Access"
              width={165}
              height={46}
              className="h-9 w-auto"
            />
            <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-500">
              {tBrand("tagline")} {tBrand("subline")}
            </p>
            <div className="mt-6 space-y-1.5 text-sm text-muted-500">
              <p>{tContact("email")}</p>
              <p>stratiqaccess.com</p>
            </div>
          </div>

          <div className="lg:col-span-3 lg:col-start-6">
            <p className="text-sm font-medium uppercase tracking-[0.1em] text-cyan-400">
              {tFooter("company")}
            </p>
            <ul className="mt-5 space-y-3.5">
              {company.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[15px] text-muted-500 hover:text-ivory-100">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="text-sm font-medium uppercase tracking-[0.1em] text-cyan-400">
              {tFooter("resources")}
            </p>
            <ul className="mt-5 space-y-3.5">
              {resources.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[15px] text-muted-500 hover:text-ivory-100">
                    {t(link.key!)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="text-sm font-medium uppercase tracking-[0.1em] text-cyan-400">{tFooter("legal")}</p>
            <ul className="mt-5 space-y-3.5">
              {legal.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[15px] text-muted-500 hover:text-ivory-100">
                    {tLegal(`${link.key}.title`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-ivory-100/8 pt-8 text-sm text-muted-600 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-3xl leading-relaxed">{tBrand("legalFooter")}</p>
          <p className="shrink-0">
            © {year} STRATIQ Access. {tFooter("rights")}
          </p>
        </div>
      </Container>
    </footer>
  );
}
