"use client";

import { motion } from "framer-motion";

export function SectorGrid({
  items,
}: {
  items: { slug: string; title: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-ivory-100/10 bg-ivory-100/10 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((sector, i) => (
        <motion.div
          key={sector.slug}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: i * 0.04 }}
          className="group relative flex min-h-[130px] flex-col justify-between bg-navy-900 p-6 transition-colors duration-300 hover:bg-navy-800/70"
        >
          <span className="text-xs font-medium text-muted-600 transition-colors group-hover:text-gold-300">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="text-[17px] font-medium leading-snug text-ivory-100">{sector.title}</span>
          <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-gold-600 to-gold-300 transition-transform duration-300 group-hover:scale-x-100" />
        </motion.div>
      ))}
    </div>
  );
}
