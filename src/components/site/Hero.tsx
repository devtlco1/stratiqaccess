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

  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div className="bg-grid absolute inset-0 opacity-70" />
      <div className="absolute -top-48 left-1/2 h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-gold-500/8 blur-[160px]" />

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
            className="mt-7 text-4xl font-semibold leading-[1.12] tracking-[-0.015em] text-ivory-100 sm:text-5xl lg:text-[3.4rem]"
          >
            Your Strategic Access to{" "}
            <span className="font-display italic font-normal text-gradient-gold">Iraq.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 text-lg font-medium text-muted-500"
          >
            {t("subline")}
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
            className="mt-10 flex flex-wrap gap-4"
          >
            <Button href="/contact">{t("ctaPrimary")}</Button>
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
