import type { Metadata } from "next";
import { Inter, Playfair_Display, Almarai } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import { routing } from "@/i18n/routing";
import { isRtl, type Locale } from "@/i18n/config";
import { siteConfig } from "@/data/siteConfig";

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
          width: 2400,
          height: 1100,
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

  return (
    <html lang={locale} dir={isRtl(locale as Locale) ? "rtl" : "ltr"}>
      <body className={`${inter.variable} ${playfair.variable} ${arabic.variable} antialiased`}>
        <NextIntlClientProvider messages={clientMessages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
