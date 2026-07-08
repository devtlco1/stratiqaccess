import { defineRouting } from "next-intl/routing";
import { locales, defaultLocale } from "./config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // English (the default) is never prefixed — / , /services, /about stay
  // exactly as they are today. Only non-default locales get a prefix (/ar,
  // /ar/services, ...).
  localePrefix: "as-needed",
  // Don't auto-redirect based on the visitor's Accept-Language header —
  // English must stay "the original/default experience" for everyone unless
  // they explicitly pick Arabic via the language switcher.
  localeDetection: false,
});
