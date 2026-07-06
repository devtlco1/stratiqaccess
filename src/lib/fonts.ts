import { Geist, Fraunces, Cairo } from "next/font/google";

export const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

/** Formal, modern Arabic sans — used for the ar locale in place of Geist. */
export const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const fontVariables = `${geist.variable} ${fraunces.variable} ${cairo.variable}`;
