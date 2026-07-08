import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { buildAlternates } from "@/i18n/alternates";
import { createPublicClient } from "@/lib/supabase/public";
import type { Locale } from "@/i18n/config";

// No /admin entries here — /admin is also disallowed in robots.ts and
// noindexed via its own layout metadata.
const STATIC_PATHS = [
  "/",
  "/about",
  "/services",
  "/sectors",
  "/case-studies",
  "/insights",
  "/contact",
  "/clients",
];

type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

function entry(path: string, locale: Locale, priority: number, changeFrequency: ChangeFrequency) {
  const { canonical, languages } = buildAlternates(path, locale);
  return {
    url: canonical,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: { languages },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient();

  const [{ data: services }, { data: sectors }, { data: insights }] = await Promise.all([
    supabase.from("services").select("slug"),
    supabase.from("sectors").select("slug"),
    supabase.from("insights").select("slug"),
  ]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of STATIC_PATHS) {
      entries.push(entry(path, locale, path === "/" ? 1 : 0.8, "weekly"));
    }
    for (const service of services ?? []) {
      entries.push(entry(`/services/${service.slug}`, locale, 0.7, "monthly"));
    }
    for (const sector of sectors ?? []) {
      entries.push(entry(`/sectors/${sector.slug}`, locale, 0.7, "monthly"));
    }
    for (const insight of insights ?? []) {
      entries.push(entry(`/insights/${insight.slug}`, locale, 0.6, "monthly"));
    }
  }

  return entries;
}
