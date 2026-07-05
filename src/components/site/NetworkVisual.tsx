"use client";

import { motion } from "framer-motion";

const nodes = [
  { x: 60, y: 80 }, { x: 220, y: 40 }, { x: 380, y: 110 },
  { x: 140, y: 200 }, { x: 320, y: 230 }, { x: 460, y: 60 },
  { x: 40, y: 260 }, { x: 480, y: 220 }, { x: 260, y: 150 },
];

const edges: [number, number][] = [
  [0, 1], [1, 2], [1, 8], [8, 3], [8, 4], [2, 5], [4, 5], [3, 6], [4, 7], [2, 7], [0, 3],
];

export function NetworkVisual({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 300"
      className={className}
      fill="none"
      aria-hidden
    >
      {edges.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="url(#gold-line)"
          strokeWidth={1}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1.6, delay: i * 0.08, ease: "easeOut" }}
        />
      ))}
      {nodes.map((n, i) => (
        <motion.circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={i === 8 ? 5 : 3}
          fill={i === 8 ? "#ddbf72" : "#c9a24b"}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.6 + i * 0.08 }}
        />
      ))}
      <defs>
        <linearGradient id="gold-line" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c9a24b" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#ddbf72" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#c9a24b" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  );
}
