import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin Console — STRATIQ Access",
  icons: {
    icon: "/favicon.ico",
    apple: "/brand/stratiq-icon-512.png",
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-navy-900 text-ivory-100">{children}</body>
    </html>
  );
}
