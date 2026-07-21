"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { HABIT_COLOR_CLASSES, TIME_OF_DAY_LABELS, isHabitColor } from "@/lib/constants";
import type { Habit } from "@/types";

export function HabitCheckCard({
  habit,
  done,
  streak,
  onToggle,
  size = "default",
}: {
  habit: Habit;
  done: boolean;
  streak: number;
  onToggle: () => void;
  size?: "default" | "large";
}) {
  const colorKey = isHabitColor(habit.color) ? habit.color : "teal";
  const colors = HABIT_COLOR_CLASSES[colorKey];
  const timeLabel =
    habit.time_of_day === "anytime"
      ? null
      : TIME_OF_DAY_LABELS[habit.time_of_day];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "group relative flex items-center gap-3 border-b border-border/80 py-3.5 last:border-b-0",
        size === "large" && "py-5"
      )}
    >
      <span
        className={cn("absolute left-0 top-3 bottom-3 w-0.5 rounded-full", colors.bar)}
        aria-hidden
      />

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        aria-label={done ? "Снять отметку" : "Отметить"}
        className={cn(
          "relative ml-3 flex shrink-0 items-center justify-center border transition-colors",
          size === "large" ? "size-11" : "size-8",
          done
            ? "border-success bg-success text-success-foreground"
            : "border-foreground/25 bg-transparent hover:border-foreground/50"
        )}
      >
        <motion.span
          initial={false}
          animate={done ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
        >
          <Check className={size === "large" ? "size-5" : "size-4"} strokeWidth={2.5} />
        </motion.span>
      </button>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate font-medium tracking-tight",
            size === "large" ? "text-lg" : "text-[15px]",
            done && "text-muted-foreground line-through decoration-foreground/25"
          )}
        >
          {habit.name}
        </p>
        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
          {[timeLabel, streak > 0 ? `${streak} дн.` : null].filter(Boolean).join(" · ")}
        </p>
      </div>

      {habit.icon && habit.icon !== "·" && (
        <span className="shrink-0 font-mono text-sm text-muted-foreground">{habit.icon}</span>
      )}
    </motion.div>
  );
}
