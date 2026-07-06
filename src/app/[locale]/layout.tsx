import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing, rtlLocales, type Locale } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import "../globals.css";

export const metadata: Metadata = {
  title: "STRATIQ Access — Your Strategic Access to Iraq",
  description:
    "STRATIQ Access is a premium Iraq market-entry, tender advisory, and local representation platform helping international companies access qualified opportunities and compete in Iraq's strategic sectors.",
  icons: {
    icon: "/favicon.ico",
    apple: "/brand/stratiq-icon-512.png",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = rtlLocales.includes(locale as Locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-navy-950 text-ivory-100">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
