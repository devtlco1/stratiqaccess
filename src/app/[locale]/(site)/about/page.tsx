import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageHero } from "@/components/sections/PageHero";
import { MarketOverview } from "@/components/sections/MarketOverview";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSiteImage } from "@/lib/siteImages";
import { buildAlternates } from "@/i18n/alternates";
import { buildOpenGraph } from "@/lib/seo";
import type { Locale } from "@/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.about" });
  const loc = locale as Locale;
  return {
    title: t("title"),
    description: t("description"),
    alternates: buildAlternates("/about", loc),
    ...buildOpenGraph({ title: t("title"), description: t("description"), path: "/about", locale: loc }),
  };
}

const statKeys = ["groundServices", "iraqFocused", "fieldSupport", "dedicatedTeam"] as const;
const stepKeys = ["assess", "coordinate", "execute"] as const;

export default async function AboutPage() {
  const heroImage = await getSiteImage("about_hero", "/images/photo-construction-iraq.jpg");
  const t = await getTranslations("seo.about");
  const tAbout = await getTranslations("about");

  return (
    <>
      <PageHero title={t("heroTitle")} image={heroImage} />

      <MarketOverview />

      <section className="py-20 bg-white">
        <Container>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 text-center">
            {statKeys.map((key) => (
              <div key={key}>
                <p className="font-display text-4xl sm:text-5xl font-bold text-stratiq-blue">
                  {tAbout(`stats.${key}.value`)}
                </p>
                <p className="mt-2 text-sm text-ink/70">{tAbout(`stats.${key}.label`)}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 lg:py-32 bg-navy">
        <Container>
          <SectionHeading
            eyebrow={tAbout("approach.eyebrow")}
            title={tAbout("approach.title")}
            tone="light"
          />

          <div className="mt-16 grid sm:grid-cols-3 gap-8">
            {stepKeys.map((key) => (
              <div key={key} className="rounded-2xl bg-white/5 border border-white/10 p-8">
                <span className="font-display text-4xl text-stratiq-blue">
                  {tAbout(`approach.steps.${key}.step`)}
                </span>
                <h3 className="mt-4 font-display text-xl text-white">
                  {tAbout(`approach.steps.${key}.title`)}
                </h3>
                <p className="mt-3 text-sm text-white/70 leading-relaxed">
                  {tAbout(`approach.steps.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
