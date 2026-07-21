"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { DayProgressRing } from "@/components/habits/day-progress-ring";
import { HabitCheckCard } from "@/components/habits/habit-check-card";
import { buildDoneSet, currentStreak } from "@/lib/streaks";
import {
  formatHumanDate,
  formatWeekdayHuman,
  isHabitDueOn,
  todayKey,
} from "@/lib/dates";
import { useAuthStore } from "@/store/auth-store";
import { useHabitsStore } from "@/store/habits-store";
import { useUIStore } from "@/store/ui-store";

const TIME_ORDER: Record<string, number> = {
  morning: 0,
  afternoon: 1,
  evening: 2,
  anytime: 3,
};

export default function TodayPage() {
  const user = useAuthStore((s) => s.user);
  const habits = useHabitsStore((s) => s.habits);
  const logs = useHabitsStore((s) => s.logs);
  const loading = useHabitsStore((s) => s.loading);
  const loaded = useHabitsStore((s) => s.loaded);
  const toggleLog = useHabitsStore((s) => s.toggleLog);
  const focusMode = useUIStore((s) => s.focusMode);
  const toggleFocusMode = useUIStore((s) => s.toggleFocusMode);

  const today = React.useMemo(() => new Date(), []);
  const tKey = todayKey();

  const dueHabits = React.useMemo(() => {
    return habits
      .filter((h) => !h.is_archived)
      .filter((h) => isHabitDueOn(h, today, buildDoneSet(logs, h.id)))
      .sort((a, b) => {
        const t = TIME_ORDER[a.time_of_day] - TIME_ORDER[b.time_of_day];
        if (t !== 0) return t;
        return a.sort_order - b.sort_order;
      });
  }, [habits, logs, today]);

  const doneMap = React.useMemo(() => {
    const map = new Map<string, boolean>();
    for (const h of dueHabits) {
      map.set(h.id, buildDoneSet(logs, h.id).has(tKey));
    }
    return map;
  }, [dueHabits, logs, tKey]);

  const completedCount = dueHabits.filter((h) => doneMap.get(h.id)).length;
  const totalCount = dueHabits.length;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const wasAllDoneRef = React.useRef(false);
  React.useEffect(() => {
    if (allDone && !wasAllDoneRef.current) {
      toast.success("День закрыт");
    }
    wasAllDoneRef.current = allDone;
  }, [allDone]);

  async function handleToggle(habitId: string) {
    if (!user) return;
    await toggleLog(user.id, habitId);
  }

  const nextHabit = dueHabits.find((h) => !doneMap.get(h.id));
  const remainingCount = totalCount - completedCount;

  return (
    <div className="flex flex-col gap-8 px-4">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {formatWeekdayHuman(today)} · {formatHumanDate(today)}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Сегодня</h1>
        </div>
        {totalCount > 0 && (
          <DayProgressRing completed={completedCount} total={totalCount} />
        )}
      </header>

      {totalCount > 0 && (
        <div className="flex items-center justify-between border-y border-border py-3">
          <div>
            <p className="text-sm font-medium">Одна за раз</p>
            <p className="text-xs text-muted-foreground">
              Показывать только следующую
            </p>
          </div>
          <Switch checked={focusMode} onCheckedChange={toggleFocusMode} />
        </div>
      )}

      {loading && !loaded && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}

      {loaded && habits.length === 0 && (
        <div className="border-y border-border py-10">
          <p className="font-medium">Нет привычек</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Добавь 3–5 штук и начинай отмечать.
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/habits">
              <Plus className="size-4" />
              Добавить
            </Link>
          </Button>
        </div>
      )}

      {loaded && habits.length > 0 && totalCount === 0 && (
        <div className="border-y border-border py-10">
          <p className="font-medium">На сегодня пусто</p>
          <p className="mt-1 text-sm text-muted-foreground">
            По расписанию сегодня ничего не стоит.
          </p>
        </div>
      )}

      {loaded && totalCount > 0 && allDone && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-y border-success/40 bg-success/5 py-8"
        >
          <p className="font-medium">Всё сделано</p>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {completedCount}/{totalCount}
          </p>
        </motion.div>
      )}

      {loaded && totalCount > 0 && !allDone && focusMode && nextHabit && (
        <div className="flex flex-col">
          <HabitCheckCard
            key={nextHabit.id}
            habit={nextHabit}
            done={false}
            streak={currentStreak(nextHabit, logs)}
            onToggle={() => handleToggle(nextHabit.id)}
            size="large"
          />
          {remainingCount > 1 && (
            <p className="mt-3 font-mono text-xs text-muted-foreground">
              ещё {remainingCount - 1}
            </p>
          )}
          {completedCount > 0 && (
            <details className="mt-6 border-t border-border pt-3">
              <summary className="cursor-pointer select-none font-mono text-xs text-muted-foreground">
                сделано · {completedCount}
              </summary>
              <div className="mt-1">
                {dueHabits
                  .filter((h) => doneMap.get(h.id))
                  .map((h) => (
                    <HabitCheckCard
                      key={h.id}
                      habit={h}
                      done
                      streak={currentStreak(h, logs)}
                      onToggle={() => handleToggle(h.id)}
                    />
                  ))}
              </div>
            </details>
          )}
        </div>
      )}

      {loaded && totalCount > 0 && !focusMode && (
        <div className="flex flex-col border-t border-border">
          <AnimatePresence initial={false}>
            {[...dueHabits]
              .sort(
                (a, b) =>
                  Number(!!doneMap.get(a.id)) - Number(!!doneMap.get(b.id))
              )
              .map((h) => (
                <HabitCheckCard
                  key={h.id}
                  habit={h}
                  done={!!doneMap.get(h.id)}
                  streak={currentStreak(h, logs)}
                  onToggle={() => handleToggle(h.id)}
                />
              ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
