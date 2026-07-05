"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function HowWeWork({
  steps,
}: {
  steps: { step: string; title: string; body: string }[];
}) {
  return (
    <div className="relative grid gap-10 lg:grid-cols-4 lg:gap-6">
      <div className="absolute left-0 right-0 top-6 hidden h-px bg-gradient-to-r from-transparent via-ivory-100/15 to-transparent lg:block" />

      {steps.map((s, i) => (
        <motion.div
          key={s.step}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: i * 0.1 }}
          className="relative"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold-500/30 bg-navy-900 font-display text-lg text-gold-400">
              {s.step}
            </span>
            {i < steps.length - 1 && (
              <ArrowRight className="hidden text-ivory-100/20 lg:block" size={18} />
            )}
          </div>
          <h3 className="mt-5 text-lg font-semibold text-ivory-100">{s.title}</h3>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-500">{s.body}</p>
        </motion.div>
      ))}
    </div>
  );
}
