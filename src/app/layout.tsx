import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "STRATIQ Access — Your Strategic Access to Iraq",
  description:
    "STRATIQ Access is a premium Iraq market-entry, tender intelligence, and local representation platform helping international companies access qualified opportunities and compete in Iraq's strategic sectors.",
  icons: {
    icon: "/favicon.ico",
    apple: "/brand/stratiq-icon-512.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-navy-900 text-ivory-100">
        {children}
      </body>
    </html>
  );
}
