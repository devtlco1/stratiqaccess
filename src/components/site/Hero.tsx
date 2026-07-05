"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Compass, Radar, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MarketSignalPanel } from "./MarketSignalPanel";

const PILLAR_ICONS = [Compass, Radar, ShieldCheck];

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

  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div className="bg-grid absolute inset-0 opacity-70" />
      <div className="absolute -top-48 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-gold-500/10 blur-[160px]" />

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
            className="mt-7 text-5xl font-semibold leading-[1.08] tracking-[-0.02em] text-ivory-100 sm:text-6xl lg:text-[3.75rem]"
          >
            Your Strategic Access to{" "}
            <span className="relative inline-block">
              <span className="font-display italic font-normal text-gradient-gold">Iraq.</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformOrigin: "left" }}
                className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-gold-500 via-gold-300 to-transparent"
              />
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-5"
          >
            {pillars.map((p, i) => {
              const Icon = PILLAR_ICONS[i] ?? Compass;
              return (
                <div key={p} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-500/25 bg-gold-500/[0.07] text-gold-400">
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  <span className="text-[15px] font-medium text-ivory-100">{p}</span>
                </div>
              );
            })}
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-xl text-lg leading-relaxed text-muted-500"
          >
            {t("description")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button href="/contact">
              {t("ctaPrimary")}
              <span aria-hidden className="ml-1">
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

      <div className="divider-line" />
    </section>
  );
}
