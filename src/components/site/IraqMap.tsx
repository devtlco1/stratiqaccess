"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Stylized, faceted Iraq silhouette — a decorative brand mark, not a
 * geographically precise boundary. Markers sit at approximate relative
 * positions for the capital and major regional centers.
 */
const OUTLINE =
  "M132 34 L246 26 L272 58 L296 76 L318 128 L300 176 L328 214 L302 262 L322 300 L278 372 L256 432 L236 462 L222 476 L206 452 L196 400 L146 384 L96 338 L58 282 L48 200 L70 116 L100 60 Z";

const MARKERS = [
  { name: "Baghdad", sub: "Headquarters", x: 182, y: 258, size: 7 },
  { name: "Erbil", sub: "Kurdistan Region", x: 268, y: 92, size: 5 },
  { name: "Basra", sub: "Gulf Access", x: 232, y: 428, size: 5 },
  { name: "Mosul", sub: "Northern Iraq", x: 218, y: 112, size: 5 },
  { name: "Najaf", sub: "Central Iraq", x: 142, y: 302, size: 5 },
];

export function IraqMap() {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const smoothX = useSpring(mx, { stiffness: 120, damping: 20 });
  const smoothY = useSpring(my, { stiffness: 120, damping: 20 });

  const rotateY = useTransform(smoothX, [0, 1], [-8, 8]);
  const rotateX = useTransform(smoothY, [0, 1], [8, -8]);
  const glowX = useTransform(smoothX, [0, 1], ["20%", "80%"]);
  const glowY = useTransform(smoothY, [0, 1], ["20%", "80%"]);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }

  function handleLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative aspect-[4/5] w-full max-w-md [perspective:1200px]"
    >
      <motion.div
        style={{ rotateX, rotateY }}
        className="relative h-full w-full [transform-style:preserve-3d]"
      >
        {/* Cursor-following spotlight */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background: useTransform(
              [glowX, glowY],
              ([x, y]) => `radial-gradient(320px circle at ${x} ${y}, rgba(201,162,77,0.16), transparent 70%)`,
            ),
          }}
        />

        <svg viewBox="0 0 400 500" className="h-full w-full" fill="none" aria-hidden>
          <defs>
            <linearGradient id="iraq-fill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#c9a24d" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#1e8c86" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="iraq-stroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#e4c98a" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#c9a24d" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#1e8c86" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          <motion.path
            d={OUTLINE}
            fill="url(#iraq-fill)"
            stroke="url(#iraq-stroke)"
            strokeWidth={1.75}
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />

          {/* faint internal facet lines for a geometric, blueprint feel */}
          <motion.g
            stroke="#c9a24d"
            strokeOpacity={0.12}
            strokeWidth={1}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <line x1="182" y1="258" x2="268" y2="92" />
            <line x1="182" y1="258" x2="232" y2="428" />
            <line x1="182" y1="258" x2="218" y2="112" />
            <line x1="182" y1="258" x2="142" y2="302" />
          </motion.g>

          {MARKERS.map((m, i) => (
            <g
              key={m.name}
              onMouseEnter={() => setHovered(m.name)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            >
              <motion.circle
                cx={m.x}
                cy={m.y}
                r={m.size}
                fill="none"
                stroke={m.name === "Baghdad" ? "#e4c98a" : "#35a29b"}
                strokeWidth={1.5}
                initial={{ scale: 0.6, opacity: 0.9 }}
                animate={{ scale: [0.6, 2.2], opacity: [0.7, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: 1.4 + i * 0.3, ease: "easeOut" }}
              />
              <motion.circle
                cx={m.x}
                cy={m.y}
                r={m.size}
                fill={m.name === "Baghdad" ? "#e4c98a" : "#35a29b"}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: hovered === m.name ? 1.3 : 1 }}
                transition={{ duration: 0.4, delay: 1.2 + i * 0.1 }}
              />
            </g>
          ))}
        </svg>

        {MARKERS.map((m) => (
          <motion.div
            key={m.name}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-sm border border-ivory-100/15 bg-navy-900/95 px-3 py-1.5"
            style={{ left: `${(m.x / 400) * 100}%`, top: `calc(${(m.y / 500) * 100}% - 12px)` }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: hovered === m.name ? 1 : 0, y: hovered === m.name ? -8 : 4 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-sm font-medium text-ivory-100">{m.name}</p>
            <p className="text-xs text-muted-500">{m.sub}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
