"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MarketSignalPanel } from "./MarketSignalPanel";

export function Hero({
  activeOpportunities,
  sectorsCount,
  servicesCount,
}: {
  activeOpportunities: number;
  sectorsCount: number;
  servicesCount: number;
}) {
  const t = useTranslations("home.hero");
  const pillars = t("subline")
    .split(". ")
    .map((s) => s.replace(/\.$/, ""))
    .filter(Boolean);
  const titleWords = t("title").split(" ");
  const titleLead = titleWords.slice(0, -1).join(" ");
  const titleAccent = titleWords[titleWords.length - 1];

  return (
    <section className="relative overflow-hidden bg-navy-950">
      <div className="bg-grid absolute inset-0 opacity-60" />

      {/* Quiet ambient gold lighting — restrained, not a neon SaaS glow */}
      <div className="pointer-events-none absolute -top-56 left-1/4 h-[560px] w-[560px] rounded-full bg-gold-500/[0.07] blur-[160px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-gold-400/[0.05] blur-[150px]" />

      <div className="relative mx-auto grid max-w-[1400px] gap-16 px-6 pb-24 pt-20 lg:grid-cols-12 lg:gap-8 lg:px-12 lg:pb-32 lg:pt-28">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Badge>{t("eyebrow")}</Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 text-5xl font-semibold leading-[1.06] tracking-[-0.025em] text-ivory-100 sm:text-6xl lg:text-[4rem]"
          >
            {titleLead}{" "}
            <span className="relative inline-block">
              <span className="font-display italic font-normal text-gradient-gold">{titleAccent}</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -bottom-1 start-0 h-[3px] w-full origin-left rtl:origin-right rounded-full bg-gradient-to-r rtl:bg-gradient-to-l from-gold-500 via-gold-300 to-transparent"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-xl font-medium text-ivory-200"
          >
            {t("tagline")}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-muted-500"
          >
            {t("description")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-3"
          >
            {pillars.map((p) => (
              <div key={p} className="border-t border-gold-500/30 pt-3">
                <span className="text-[14.5px] font-medium text-ivory-100">{p}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button href="/contact">
              {t("ctaPrimary")}
              <span aria-hidden className="ms-1 inline-block rtl:-scale-x-100">
                &rarr;
              </span>
            </Button>
            <Button href="/tenders" variant="outline">
              {t("ctaSecondary")}
            </Button>
          </motion.div>
        </div>

        <div className="relative flex min-w-0 items-center justify-center lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="w-full"
          >
            <MarketSignalPanel
              activeOpportunities={activeOpportunities}
              sectorsCount={sectorsCount}
              servicesCount={servicesCount}
            />
          </motion.div>
        </div>
      </div>

      <div className="divider-glow relative opacity-40" />
    </section>
  );
}
