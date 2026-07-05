import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";

const company = [
  { href: "/about", key: "about" },
  { href: "/services", key: "services" },
  { href: "/sectors", key: "sectors" },
  { href: "/partnerships", key: "partnerships" },
] as const;

type NavKey = "about" | "services" | "sectors" | "iraqMarketAccess" | "tenderIntelligence" | "partnerships" | "insights" | "contact" | "cta";

const resources: { href: string; key?: NavKey; label?: string }[] = [
  { href: "/tender-intelligence", key: "tenderIntelligence" },
  { href: "/tenders", label: "Iraq Tenders" },
  { href: "/insights", key: "insights" },
  { href: "/legal/confidentiality", label: "Confidentiality & Protection" },
];

export function Footer() {
  const t = useTranslations("nav");
  const tFooter = useTranslations("footer");
  const tBrand = useTranslations("brand");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-navy-900/60">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <p className="font-display text-lg text-silver-100">
              STRATIQ <span className="text-gold-400">Access</span>
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-silver-300">
              {tBrand("tagline")} {tBrand("subline")}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold-400">
              {tFooter("company")}
            </p>
            <ul className="mt-4 space-y-3">
              {company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-silver-300 hover:text-gold-400"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold-400">
              {tFooter("resources")}
            </p>
            <ul className="mt-4 space-y-3">
              {resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-silver-300 hover:text-gold-400"
                  >
                    {link.key ? t(link.key) : link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-white/5 pt-8 text-xs text-silver-400 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-3xl leading-relaxed">{tBrand("legalFooter")}</p>
          <p>
            © {year} STRATIQ Access. {tFooter("rights")}
          </p>
        </div>
      </Container>
    </footer>
  );
}
