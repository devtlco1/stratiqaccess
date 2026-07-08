import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { introPointKeys } from "@/data/introduction";
import { marketDynamics } from "@/data/marketDynamics";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { getSiteImages } from "@/lib/siteImages";

function ArrowItem({ title, description }: { title: string; description: string }) {
  return (
    <li className="flex gap-3">
      <Icon name="arrow-right" className="mt-1.5 size-3.5 shrink-0 rotate-45 rtl:-scale-x-100 text-stratiq-blue" />
      <p className="text-base text-ink/80 leading-relaxed">
        <span className="font-semibold text-navy">{title}</span>: {description}
      </p>
    </li>
  );
}

export async function MarketOverview() {
  const images = await getSiteImages(["intro_1", "intro_2", "intro_3"]);
  const intro1 = images.intro_1 || "/images/photo-baghdad-skyline.jpg";
  const intro2 = images.intro_2 || "/images/photo-baghdad-2023.jpg";
  const intro3 = images.intro_3 || "/images/photo-construction-iraq.jpg";
  const t = await getTranslations("home.introduction");

  return (
    <section className="py-24 lg:py-32 bg-white">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="flex flex-col">
            {/* Managed from Admin → Site Images → "Homepage Introduction — Image 1/2/3" */}
            <div className="relative aspect-[6/5] overflow-hidden">
              <Image
                src={intro1}
                alt="Baghdad skyline"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-2/3 overflow-hidden">
              <Image
                src={intro2}
                alt="Street view in Baghdad"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[6/5] overflow-hidden">
              <Image
                src={intro3}
                alt="Construction and development in Iraq"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-stratiq-blue">
              {t("eyebrow")}
            </span>
            <h2 className="mt-4 font-display text-3xl sm:text-4xl text-navy leading-tight">
              {t("title")}
            </h2>
            <p className="mt-6 text-base sm:text-lg text-ink/80 leading-relaxed">{t("lead")}</p>

            <ul className="mt-6 flex flex-col gap-3">
              {introPointKeys.map((key) => (
                <ArrowItem
                  key={key}
                  title={t(`points.${key}.title`)}
                  description={t(`points.${key}.description`)}
                />
              ))}
            </ul>

            <h3 className="mt-12 font-display text-2xl text-navy leading-snug">
              {t("coverageTitle")}
            </h3>
            <p className="mt-4 text-base text-ink/80 leading-relaxed">{t("coverageLead")}</p>

            <ul className="mt-6 flex flex-col gap-3">
              {marketDynamics.map((item) => (
                <ArrowItem
                  key={item.key}
                  title={t(`dynamics.${item.key}.title`)}
                  description={t(`dynamics.${item.key}.description`)}
                />
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
