import { siteConfig } from "@/data/siteConfig";
import { routing } from "@/i18n/routing";
import type { Locale } from "@/i18n/config";

function localizedUrl(path: string, locale: Locale): string {
  const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
  return `${siteConfig.url}${path === "/" ? prefix || "/" : `${prefix}${path}`}`;
}

// Builds the per-page Open Graph + Twitter card metadata fragment. Every page's
// generateMetadata() already computes its own title/description for <title> and
// <meta name="description"> (and canonical/hreflang via buildAlternates) — this
// mirrors that same title/description into openGraph/twitter instead of letting
// pages silently inherit the root layout's one static OG block for every URL.
export function buildOpenGraph({
  title,
  description,
  path,
  locale,
  image,
}: {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  image?: string | null;
}) {
  const url = localizedUrl(path, locale);
  const imageUrl = image
    ? image.startsWith("http")
      ? image
      : `${siteConfig.url}${image}`
    : `${siteConfig.url}/brand/stratiq-social-share.png`;

  return {
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "website" as const,
      locale: locale === "ar" ? "ar_IQ" : "en_US",
      images: [{ url: imageUrl, width: 2630, height: 871, alt: title }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [imageUrl],
    },
  };
}

// Site-wide Organization + WebSite schema — injected once in the root
// [locale]/layout.tsx. "legalName" carries the actual operating entity
// (Abraj Al-Anwar ...) since schema.org has no dedicated "operated by" field.
export function buildOrganizationSchema(locale: Locale) {
  const url = localizedUrl("/", locale);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    legalName: "Abraj Al-Anwar for General Trading, General Contracting and Commercial Agencies Ltd.",
    url,
    logo: `${siteConfig.url}/brand/stratiq-logo-blue.svg`,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Baghdad",
      addressCountry: "IQ",
    },
  };
}

export function buildWebSiteSchema(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: localizedUrl("/", locale),
    inLanguage: locale,
  };
}

// Schema-only breadcrumbs (no visual breadcrumb bar) — `items` excludes the
// implicit "Home" root, which this always prepends.
export function buildBreadcrumbList(
  items: { name: string; path: string }[],
  locale: Locale,
  homeName: string
) {
  const all = [{ name: homeName, path: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: localizedUrl(item.path, locale),
    })),
  };
}

export function buildServiceSchema({
  name,
  description,
  path,
  locale,
}: {
  name: string;
  description: string;
  path: string;
  locale: Locale;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: localizedUrl(path, locale),
    provider: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
    areaServed: "Iraq",
  };
}

export function buildFAQSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function buildArticleSchema({
  headline,
  description,
  path,
  locale,
  datePublished,
  image,
}: {
  headline: string;
  description: string;
  path: string;
  locale: Locale;
  datePublished: string;
  image?: string | null;
}) {
  const organization = {
    "@type": "Organization" as const,
    name: siteConfig.name,
    logo: { "@type": "ImageObject" as const, url: `${siteConfig.url}/brand/stratiq-logo-blue.svg` },
  };
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url: localizedUrl(path, locale),
    datePublished,
    inLanguage: locale,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: organization,
    ...(image ? { image } : {}),
  };
}
