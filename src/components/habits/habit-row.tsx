"use client";

import { Archive, ArchiveRestore, MoreVertical, Pencil, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  FREQUENCY_LABELS,
  HABIT_COLOR_CLASSES,
  TIME_OF_DAY_LABELS,
  isHabitColor,
} from "@/lib/constants";
import type { Habit, HabitLog } from "@/types";
import { currentStreak } from "@/lib/streaks";

export function HabitRow({
  habit,
  logs,
  onEdit,
  onArchiveToggle,
  onDelete,
}: {
  habit: Habit;
  logs: HabitLog[];
  onEdit: () => void;
  onArchiveToggle: () => void;
  onDelete: () => void;
}) {
  const colorKey = isHabitColor(habit.color) ? habit.color : "teal";
  const colors = HABIT_COLOR_CLASSES[colorKey];
  const streak = currentStreak(habit, logs);
  const time = TIME_OF_DAY_LABELS[habit.time_of_day];

  return (
    <div className="flex items-center gap-3 border-b border-border py-3.5 last:border-b-0">
      <span className={`h-8 w-0.5 shrink-0 ${colors.bar}`} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{habit.name}</p>
        <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
          {[FREQUENCY_LABELS[habit.frequency], time, streak > 0 ? `${streak} дн.` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Действия">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="size-4" />
            Изменить
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onArchiveToggle}>
            {habit.is_archived ? (
              <>
                <ArchiveRestore className="size-4" />
                Восстановить
              </>
            ) : (
              <>
                <Archive className="size-4" />
                Архивировать
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={onDelete}>
            <Trash2 className="size-4" />
            Удалить
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
