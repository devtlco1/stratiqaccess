import Image from "next/image";
import { siteConfig } from "@/data/siteConfig";
import { Icon } from "@/components/ui/Icon";
import { getSiteImage } from "@/lib/siteImages";

export async function Hero() {
  const heroImage = await getSiteImage("hero_bg", "/images/photo-baghdad-tigris.jpg");

  return (
    <section className="relative flex min-h-[85vh] items-center overflow-hidden bg-navy pt-20 lg:pt-24">
      {/* Managed from Admin → Site Images → "Homepage — Hero Background" */}
      <Image src={heroImage} alt="" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-10">
        <div className="max-w-3xl">
          <h1 className="animate-fade-in-up font-display text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.05]">
            {siteConfig.name}
          </h1>
          <p
            className="animate-fade-in-up mt-6 text-lg sm:text-xl text-white/90 font-medium"
            style={{ animationDelay: "0.1s" }}
          >
            {siteConfig.tagline}
          </p>
          <p
            className="animate-fade-in-up mt-5 max-w-2xl text-base sm:text-lg text-white/70 leading-relaxed"
            style={{ animationDelay: "0.2s" }}
          >
            We support international companies entering Iraq through market intelligence, tender
            tracking, local representation, partnership building, and strategic advisory.
          </p>
          <div className="animate-fade-in-up mt-10" style={{ animationDelay: "0.3s" }}>
            <a
              href="#services"
              className="group inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-white"
            >
              <span className="border-b border-white/60 pb-1 group-hover:border-white transition-colors">
                Explore
              </span>
              <Icon name="arrow-right" className="size-4 rotate-45 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
