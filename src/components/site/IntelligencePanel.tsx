"use client";

import { motion } from "framer-motion";

const tenderCards = [
  { sector: "Smart Metering", status: "Open", offset: 0 },
  { sector: "Solar & Renewables", status: "Under Review", offset: 1 },
  { sector: "Data Centers", status: "Open", offset: 2 },
];

const signals = [
  "9 Sectors Monitored",
  "Live Tender Intelligence",
  "NDA-Protected Disclosure",
];

/**
 * A stylized, abstracted Iraq silhouette — decorative brand mark, not a
 * geographically precise boundary.
 */
function IraqOutline() {
  return (
    <svg viewBox="0 0 400 460" className="h-full w-full" fill="none" aria-hidden>
      <motion.path
        d="M110 30 L260 30 L275 95 L340 110 L355 175 L300 230 L320 290 L270 360 L230 430 L150 420 L120 350 L70 330 L55 250 L90 200 L65 140 L95 80 Z"
        stroke="url(#outline-gradient)"
        strokeWidth="1.5"
        fill="rgba(201,162,77,0.03)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 2, ease: "easeInOut" }}
      />
      <defs>
        <linearGradient id="outline-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c9a24d" stopOpacity="0.15" />
          <stop offset="50%" stopColor="#c9a24d" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#1e8c86" stopOpacity="0.3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function IntelligencePanel() {
  return (
    <div className="relative aspect-square w-full max-w-lg">
      <div className="absolute inset-0 opacity-80">
        <IraqOutline />
      </div>

      {/* Scan line sweep */}
      <motion.div
        className="absolute inset-x-6 h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent"
        initial={{ top: "10%", opacity: 0 }}
        animate={{ top: ["10%", "90%"], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
      />

      {/* Floating tender cards */}
      <div className="absolute inset-0 flex flex-col justify-center gap-4 px-2">
        {tenderCards.map((card, i) => (
          <motion.div
            key={card.sector}
            initial={{ opacity: 0, x: 30, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginLeft: `${card.offset * 28}px` }}
            className="w-[78%] rounded-md border border-ivory-100/12 bg-navy-800/85 px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-ivory-100">{card.sector}</span>
              <span
                className={
                  card.status === "Open"
                    ? "rounded-sm bg-teal-500/15 px-2 py-0.5 text-xs font-medium text-teal-400"
                    : "rounded-sm bg-gold-500/15 px-2 py-0.5 text-xs font-medium text-gold-400"
                }
              >
                {card.status}
              </span>
            </div>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-ivory-100/8">
              <motion.div
                className="h-full bg-gradient-to-r from-teal-500 to-gold-500"
                initial={{ width: "0%" }}
                animate={{ width: `${55 + i * 15}%` }}
                transition={{ duration: 1.2, delay: 1 + i * 0.15 }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Signal ticker */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.3 }}
        className="absolute inset-x-2 bottom-2 flex flex-wrap gap-x-5 gap-y-2 border-t border-ivory-100/10 pt-4"
      >
        {signals.map((signal) => (
          <span key={signal} className="flex items-center gap-2 text-xs text-muted-500">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            {signal}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
