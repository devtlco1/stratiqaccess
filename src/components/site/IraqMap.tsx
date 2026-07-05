"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Iraq's actual national boundary, projected from real coordinates
 * (Natural Earth country boundary data, equirectangular projection at
 * Iraq's latitude) into a 400x345 viewBox. Not a stylistic guess —
 * traced from the real outline. Marker positions are similarly
 * projected from each city's real lat/lon.
 */
const VIEWBOX_W = 400;
const VIEWBOX_H = 345.2;

const OUTLINE =
  "M 264.1 71.8 L 288.2 82.9 L 291.0 104.4 L 272.5 117.1 L 264.0 145.9 L 289.5 180.9 L 334.6 201.0 L 353.5 229.0 L 347.5 255.7 L 359.3 255.7 L 359.6 275.3 L 380.0 294.7 L 358.1 292.9 L 333.4 289.8 L 306.4 325.2 L 237.9 322.2 L 134.1 248.1 L 79.2 222.4 L 34.8 212.4 L 20.0 167.5 L 101.5 129.2 L 115.4 84.7 L 112.0 57.8 L 132.1 48.7 L 151.0 25.7 L 166.8 20.0 L 209.7 24.8 L 222.6 34.1 L 240.2 27.9 L 264.1 71.8 Z";

const MARKERS = [
  { name: "Baghdad", sub: "Headquarters", x: 225.3, y: 169.9, size: 7 },
  { name: "Erbil", sub: "Kurdistan Region", x: 212.1, y: 64.0, size: 5 },
  { name: "Mosul", sub: "Northern Iraq", x: 179.3, y: 58.2, size: 5 },
  { name: "Najaf", sub: "Central Iraq", x: 224.0, y: 218.4, size: 5 },
  { name: "Basra", sub: "Gulf Access", x: 351.0, y: 273.2, size: 5 },
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
      className="relative aspect-[400/345] w-full max-w-lg [perspective:1200px]"
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

        <svg viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} className="h-full w-full" fill="none" aria-hidden>
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
            <line x1="225.3" y1="169.9" x2="212.1" y2="64.0" />
            <line x1="225.3" y1="169.9" x2="179.3" y2="58.2" />
            <line x1="225.3" y1="169.9" x2="224.0" y2="218.4" />
            <line x1="225.3" y1="169.9" x2="351.0" y2="273.2" />
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
            style={{
              left: `${(m.x / VIEWBOX_W) * 100}%`,
              top: `calc(${(m.y / VIEWBOX_H) * 100}% - 12px)`,
            }}
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
