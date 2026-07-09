import type { Metadata } from "next";
import { Inter, Playfair_Display, Almarai } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { isRtl, type Locale } from "@/i18n/config";
import { siteConfig } from "@/data/siteConfig";
import { buildOrganizationSchema, buildWebSiteSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { Analytics } from "@/components/analytics/Analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const arabic = Almarai({
  subsets: ["arabic"],
  weight: ["400", "700", "800"],
  variable: "--font-arabic",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t("defaultTitle"),
      template: t("titleTemplate"),
    },
    description: t("defaultDescription"),
    icons: {
      icon: [
        { url: "/favicon-stratiq-v2.ico", sizes: "any" },
        { url: "/icon-stratiq-v2.png", type: "image/png", sizes: "512x512" },
      ],
      apple: [{ url: "/apple-touch-icon-stratiq-v2.png", sizes: "180x180" }],
      shortcut: ["/favicon-stratiq-v2.ico"],
    },
    openGraph: {
      title: t("siteName"),
      description: t("defaultDescription"),
      url: siteConfig.url,
      siteName: t("siteName"),
      type: "website",
      locale: locale === "ar" ? "ar_IQ" : "en_US",
      images: [
        {
          url: "/brand/stratiq-social-share.png",
          width: 2630,
          height: 871,
          alt: t("siteName"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("siteName"),
      description: t("defaultDescription"),
      images: ["/brand/stratiq-social-share.png"],
    },
  };
}

// Public marketing pages read via the cookie-free public Supabase client
// (see src/lib/supabase/public.ts), so this route group is eligible for
// Next.js's Full Route Cache — revalidate on a timer, with instant
// on-demand invalidation already wired up via revalidatePath() in the
// admin actions.
export const revalidate = 300;

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const messages = await getMessages();
  // Only the namespaces client components actually need are sent to the
  // browser — server components read translations directly via
  // getTranslations and never ship their copy as client JS.
  const clientMessages = {
    common: messages.common,
    navigation: messages.navigation,
    contact: messages.contact,
  };

  const loc = locale as Locale;

  return (
    <html lang={locale} dir={isRtl(loc) ? "rtl" : "ltr"}>
      <body className={`${inter.variable} ${playfair.variable} ${arabic.variable} antialiased`}>
        <JsonLd data={buildOrganizationSchema(loc)} />
        <JsonLd data={buildWebSiteSchema(loc)} />
        <NextIntlClientProvider messages={clientMessages}>{children}</NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
