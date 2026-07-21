"use client";

import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Heatmap } from "@/components/stats/heatmap";
import { HABIT_COLOR_CLASSES, isHabitColor } from "@/lib/constants";
import {
  buildHeatmap,
  buildInsights,
  completionRate,
  currentStreak,
  longestStreak,
} from "@/lib/streaks";
import { useHabitsStore } from "@/store/habits-store";

export default function StatsPage() {
  const habits = useHabitsStore((s) => s.habits);
  const logs = useHabitsStore((s) => s.logs);
  const loaded = useHabitsStore((s) => s.loaded);

  const activeHabits = React.useMemo(
    () => habits.filter((h) => !h.is_archived),
    [habits]
  );
  const insights = React.useMemo(
    () => buildInsights(activeHabits, logs),
    [activeHabits, logs]
  );
  const heatCells = React.useMemo(
    () => buildHeatmap(activeHabits, logs, 98),
    [activeHabits, logs]
  );

  if (!loaded) {
    return (
      <div className="flex flex-col gap-4 px-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (activeHabits.length === 0) {
    return (
      <div className="flex flex-col gap-3 px-4">
        <h1 className="text-3xl font-semibold tracking-tight">Статистика</h1>
        <p className="border-y border-border py-8 text-sm text-muted-foreground">
          Появится после первых отметок.
        </p>
      </div>
    );
  }

  const metrics = [
    { label: "стрик", value: insights.currentOverallStreak },
    { label: "рекорд", value: insights.longestOverallStreak },
    { label: "30 дн.", value: `${insights.completionRate30}%` },
    { label: "лучший день", value: insights.bestWeekday ?? "—" },
  ];

  return (
    <div className="flex flex-col gap-10 px-4">
      <h1 className="text-3xl font-semibold tracking-tight">Статистика</h1>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-6 border-y border-border py-6 sm:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label}>
            <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {m.label}
            </dt>
            <dd className="mt-1 font-mono text-2xl font-medium tabular-nums tracking-tight">
              {m.value}
            </dd>
          </div>
        ))}
      </dl>

      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          14 недель
        </h2>
        <div className="mt-3">
          <Heatmap cells={heatCells} />
        </div>
      </section>

      <section>
        <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          По привычкам
        </h2>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {activeHabits.map((habit) => {
            const colorKey = isHabitColor(habit.color) ? habit.color : "teal";
            const colors = HABIT_COLOR_CLASSES[colorKey];
            return (
              <li key={habit.id} className="flex items-center gap-3 py-3.5">
                <span className={`h-8 w-0.5 shrink-0 ${colors.bar}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{habit.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {completionRate(habit, logs, 30)}% · рекорд{" "}
                    {longestStreak(habit, logs)}
                  </p>
                </div>
                <span className="font-mono text-sm tabular-nums">
                  {currentStreak(habit, logs)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
