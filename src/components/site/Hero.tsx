"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { NetworkVisual } from "./NetworkVisual";

export function Hero() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative overflow-hidden bg-navy-950">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="absolute -top-40 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-gold-500/10 blur-[140px]" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-24 pt-28 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-32 lg:pt-36">
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
            className="mt-6 font-display text-4xl leading-[1.1] text-silver-100 sm:text-5xl lg:text-6xl"
          >
            <span className="text-gradient-gold italic">{t("title")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 text-sm uppercase tracking-[0.25em] text-silver-300"
          >
            {t("subline")}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 max-w-xl text-base leading-relaxed text-silver-300"
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
            <Button href="/services" variant="outline">
              {t("ctaSecondary")}
            </Button>
          </motion.div>
        </div>

        <div className="relative flex items-center justify-center lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="w-full max-w-lg"
          >
            <NetworkVisual className="w-full" />
          </motion.div>
        </div>
      </div>

      <div className="divider-gold" />
    </section>
  );
}
