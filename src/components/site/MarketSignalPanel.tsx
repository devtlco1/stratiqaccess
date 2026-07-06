"use client";

import { useEffect, useState } from "react";
import { animate, motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { rtlLocales, type Locale } from "@/i18n/routing";

function useCountUp(target: number, duration = 1.4, delay = 0) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const controls = animate(0, target, {
        duration,
        ease: "easeOut",
        onUpdate: (v) => setValue(Math.round(v)),
      });
      return () => controls.stop();
    }, delay * 1000);
    return () => clearTimeout(timeout);
  }, [target, duration, delay]);

  return value;
}

function StatRow({
  label,
  value,
  delay,
  suffix = "",
}: {
  label: string;
  value: number;
  delay: number;
  suffix?: string;
}) {
  const count = useCountUp(value, 1.3, delay);

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-center justify-between border-b border-ivory-100/8 py-4 last:border-b-0"
    >
      <span className="text-[13px] uppercase tracking-[0.1em] text-muted-600">{label}</span>
      <span className="text-2xl font-semibold tabular-nums text-ivory-100">
        {String(count).padStart(2, "0")}
        {suffix}
      </span>
    </motion.div>
  );
}

export function MarketSignalPanel({
  activeOpportunities,
  sectorsCount,
  servicesCount,
}: {
  activeOpportunities: number;
  sectorsCount: number;
  servicesCount: number;
}) {
  const t = useTranslations("home.marketSignal");
  const locale = useLocale();
  const isRtl = rtlLocales.includes(locale as Locale);
  const signals = t.raw("signals") as string[];

  return (
    <div className="w-full max-w-lg rounded-md border border-ivory-100/12 bg-navy-950/80 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between border-b border-ivory-100/10 px-6 py-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.15em] text-teal-400">{t("live")}</span>
        </div>
        <span className="text-xs font-medium uppercase tracking-[0.1em] text-muted-600">
          {t("brandLabel")}
        </span>
      </div>

      <div className="px-6 py-2">
        <StatRow label={t("activeOpportunities")} value={activeOpportunities} delay={0.1} />
        <StatRow label={t("sectorsMonitored")} value={sectorsCount} delay={0.25} />
        <StatRow label={t("serviceLines")} value={servicesCount} delay={0.4} />
      </div>

      <div className="overflow-hidden border-t border-ivory-100/10 py-3">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: isRtl ? ["0%", "50%"] : ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...signals, ...signals].map((s, i) => (
            <span key={i} className="mx-4 text-[11px] font-medium tracking-[0.04em] text-muted-600">
              <span className="me-4 text-gold-500">◆</span>
              {s}
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
