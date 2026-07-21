import type { Habit, HabitLog } from "@/types";
import {
  addDays,
  isHabitScheduledOnWeekday,
  toDateKey,
  todayKey,
  weekDateKeys,
} from "@/lib/dates";

const MAX_STREAK_LOOKBACK_DAYS = 365 * 5;
const MAX_STREAK_LOOKBACK_WEEKS = 260;

export function buildDoneSet(logs: HabitLog[], habitId: string): Set<string> {
  const set = new Set<string>();
  for (const log of logs) {
    if (log.habit_id === habitId) set.add(log.done_date);
  }
  return set;
}

export function currentStreak(habit: Habit, logs: HabitLog[]): number {
  if (habit.frequency === "weekly_n") {
    return currentWeeklyStreak(habit, logs);
  }

  const done = buildDoneSet(logs, habit.id);
  const today = new Date();
  let cursor = done.has(toDateKey(today)) ? today : addDays(today, -1);
  let streak = 0;

  for (let i = 0; i < MAX_STREAK_LOOKBACK_DAYS; i++) {
    if (!isHabitScheduledOnWeekday(habit, cursor)) {
      cursor = addDays(cursor, -1);
      continue;
    }
    if (!done.has(toDateKey(cursor))) break;
    streak++;
    cursor = addDays(cursor, -1);
  }

  return streak;
}

function currentWeeklyStreak(habit: Habit, logs: HabitLog[]): number {
  const done = buildDoneSet(logs, habit.id);
  const today = new Date();
  let weeks = 0;

  for (let w = 0; w < MAX_STREAK_LOOKBACK_WEEKS; w++) {
    const count = weekDateKeys(addDays(today, -w * 7)).filter((key) =>
      done.has(key)
    ).length;

    if (count >= habit.weekly_target) {
      weeks++;
    } else if (w > 0) {
      // текущая неделя не завершена — это не обрывает стрик
      break;
    }
  }

  return weeks;
}

export function longestStreak(habit: Habit, logs: HabitLog[]): number {
  const done = buildDoneSet(logs, habit.id);
  if (done.size === 0) return 0;

  const sortedKeys = Array.from(done).sort();
  const maxGapDays = habit.frequency === "weekdays" ? 3 : 1; // допускаем разрыв через выходные

  let longest = 0;
  let current = 0;
  let prevDate: Date | null = null;

  for (const key of sortedKeys) {
    const date = new Date(key);
    const diffDays = prevDate
      ? Math.round((date.getTime() - prevDate.getTime()) / 86_400_000)
      : 1;
    current = diffDays <= maxGapDays ? current + 1 : 1;
    longest = Math.max(longest, current);
    prevDate = date;
  }

  return longest;
}

/** Процент выполнения за последние N дней (только по due-дням). */
export function completionRate(
  habit: Habit,
  logs: HabitLog[],
  days: number
): number {
  const done = buildDoneSet(logs, habit.id);
  const today = new Date();
  let due = 0;
  let completed = 0;

  for (let i = 0; i < days; i++) {
    const date = addDays(today, -i);
    if (!isHabitScheduledOnWeekday(habit, date)) continue;
    due++;
    if (done.has(toDateKey(date))) completed++;
  }

  return due === 0 ? 0 : Math.round((completed / due) * 100);
}

export interface DayHeatCell {
  date: Date;
  dateKey: string;
  ratio: number;
  dueCount: number;
  doneCount: number;
}

/** Данные для heatmap за последние N дней по всем переданным привычкам. */
export function buildHeatmap(
  habits: Habit[],
  logs: HabitLog[],
  days: number
): DayHeatCell[] {
  const doneByHabit = new Map(
    habits.map((habit) => [habit.id, buildDoneSet(logs, habit.id)])
  );
  const today = new Date();
  const cells: DayHeatCell[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    const dateKey = toDateKey(date);
    let due = 0;
    let done = 0;

    for (const habit of habits) {
      if (!isHabitScheduledOnWeekday(habit, date)) continue;
      due++;
      if (doneByHabit.get(habit.id)?.has(dateKey)) done++;
    }

    cells.push({
      date,
      dateKey,
      ratio: due === 0 ? 0 : done / due,
      dueCount: due,
      doneCount: done,
    });
  }

  return cells;
}

export interface Insights {
  bestWeekday: string | null;
  currentOverallStreak: number;
  longestOverallStreak: number;
  completionRate30: number;
}

const WEEKDAY_LABELS_SHORT = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export function buildInsights(habits: Habit[], logs: HabitLog[]): Insights {
  const heat = buildHeatmap(habits, logs, 90);

  const weekdayTotals = new Array(7).fill(0);
  const weekdayCounts = new Array(7).fill(0);
  for (const cell of heat) {
    const weekday = (cell.date.getDay() + 6) % 7;
    weekdayTotals[weekday] += cell.ratio;
    weekdayCounts[weekday] += 1;
  }

  let bestWeekday: string | null = null;
  let bestScore = -1;
  for (let i = 0; i < 7; i++) {
    if (weekdayCounts[i] === 0) continue;
    const avg = weekdayTotals[i] / weekdayCounts[i];
    if (avg > bestScore) {
      bestScore = avg;
      bestWeekday = WEEKDAY_LABELS_SHORT[i];
    }
  }

  const last30 = heat.slice(-30);
  const due30 = last30.reduce((sum, cell) => sum + cell.dueCount, 0);
  const done30 = last30.reduce((sum, cell) => sum + cell.doneCount, 0);

  const todaysKey = todayKey();
  let currentOverallStreak = 0;
  for (const cell of [...heat].reverse()) {
    if (cell.dueCount === 0) continue;
    if (cell.dateKey === todaysKey && cell.ratio < 1) continue; // сегодня ещё не закрыт — не против стрика
    if (cell.ratio < 1) break;
    currentOverallStreak++;
  }

  let longestOverallStreak = 0;
  let run = 0;
  for (const cell of heat) {
    if (cell.dueCount === 0) continue;
    run = cell.ratio >= 1 ? run + 1 : 0;
    longestOverallStreak = Math.max(longestOverallStreak, run);
  }

  return {
    bestWeekday,
    currentOverallStreak,
    longestOverallStreak,
    completionRate30: due30 === 0 ? 0 : Math.round((done30 / due30) * 100),
  };
}
