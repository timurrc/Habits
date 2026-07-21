"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { formatHumanDate } from "@/lib/dates";
import type { DayHeatCell } from "@/lib/streaks";

function cellClass(cell: DayHeatCell): string {
  if (cell.dueCount === 0) return "bg-muted/40";
  if (cell.ratio >= 1) return "bg-success";
  if (cell.ratio >= 0.66) return "bg-primary";
  if (cell.ratio >= 0.33) return "bg-primary/50";
  if (cell.ratio > 0) return "bg-primary/25";
  return "bg-muted";
}

export function Heatmap({ cells }: { cells: DayHeatCell[] }) {
  const weeks = React.useMemo(() => {
    const padded = [...cells];
    const firstWeekday = (padded[0]?.date.getDay() ?? 1) + 6;
    const offset = firstWeekday % 7;
    for (let i = 0; i < offset; i++) {
      padded.unshift(null as unknown as DayHeatCell);
    }
    const cols: (DayHeatCell | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      cols.push(padded.slice(i, i + 7));
    }
    return cols;
  }, [cells]);

  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((cell, di) =>
            cell ? (
              <div
                key={di}
                title={`${formatHumanDate(cell.date)}: ${cell.doneCount}/${cell.dueCount}`}
                className={cn("size-3.5 rounded-sm", cellClass(cell))}
              />
            ) : (
              <div key={di} className="size-3.5 rounded-sm bg-transparent" />
            )
          )}
        </div>
      ))}
    </div>
  );
}
