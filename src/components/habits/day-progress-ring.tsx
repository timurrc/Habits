"use client";

import { motion } from "framer-motion";

export function DayProgressRing({
  completed,
  total,
  size = 72,
}: {
  completed: number;
  total: number;
  size?: number;
}) {
  const ratio = total === 0 ? 0 : completed / total;
  const stroke = 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className="fill-none stroke-border"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="square"
          className={ratio >= 1 ? "fill-none stroke-success" : "fill-none stroke-primary"}
          style={{ strokeDasharray: circumference }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - ratio) }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-mono text-sm font-medium tabular-nums leading-none">
          {completed}/{total}
        </span>
      </div>
    </div>
  );
}
