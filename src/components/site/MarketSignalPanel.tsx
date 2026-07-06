"use client";

import { useEffect, useState } from "react";
import { animate, motion } from "framer-motion";
import { useTranslations } from "next-intl";

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

  return (
    <div className="glass-panel glow-gold w-full max-w-lg rounded-xl shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between border-b border-gold-500/15 px-6 py-4">
        <span className="text-xs font-medium uppercase tracking-[0.16em] text-gold-400">
          {t("brandLabel")}
        </span>
        <span className="h-1 w-1 rounded-full bg-gold-500/60" />
      </div>

      <div className="px-6 py-2">
        <StatRow label={t("activeOpportunities")} value={activeOpportunities} delay={0.1} />
        <StatRow label={t("sectorsMonitored")} value={sectorsCount} delay={0.25} />
        <StatRow label={t("serviceLines")} value={servicesCount} delay={0.4} />
      </div>

      <div className="divider-line" />
    </div>
  );
}
