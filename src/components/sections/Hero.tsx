import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { siteConfig } from "@/data/siteConfig";
import { Button } from "@/components/ui/Button";
import { getSiteImage } from "@/lib/siteImages";

export async function Hero() {
  const heroImage = await getSiteImage("hero_bg", "/images/photo-baghdad-tigris.jpg");
  const t = await getTranslations("home.hero");

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-navy pt-20 lg:pt-24">
      {/* Managed from Admin → Site Images → "Homepage — Hero Background" */}
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/10" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl">
          <span
            className="animate-fade-in-up inline-block text-xs font-semibold uppercase tracking-[0.2em] text-white/70"
          >
            {t("tagline")}
          </span>
          <h1
            className="animate-fade-in-up mt-5 font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05]"
            style={{ animationDelay: "0.1s" }}
          >
            {t("title")}
          </h1>
          <p
            className="animate-fade-in-up mt-6 max-w-2xl text-base sm:text-lg text-white/80 leading-relaxed"
            style={{ animationDelay: "0.2s" }}
          >
            {t("subtitle")}
          </p>
          <div
            className="animate-fade-in-up mt-10 flex flex-wrap items-center gap-4"
            style={{ animationDelay: "0.3s" }}
          >
            <Button href={siteConfig.hero.primaryCtaHref} variant="primary">
              {t("primaryCta")}
            </Button>
            <Button href={siteConfig.hero.secondaryCtaHref} variant="outline">
              {t("secondaryCta")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
