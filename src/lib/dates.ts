import type { Habit } from "@/types";

/** YYYY-MM-DD в локальном времени, без сдвига по UTC. */
export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return toDateKey(new Date());
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Понедельник = 0 ... воскресенье = 6. */
export function isoWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function startOfWeek(date: Date): Date {
  return addDays(date, -isoWeekday(date));
}

/** Ключи всех дней ISO-недели, которой принадлежит `date`. */
export function weekDateKeys(date: Date): string[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => toDateKey(addDays(start, i)));
}

const MONTH_LABELS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

export function formatHumanDate(date: Date): string {
  return `${date.getDate()} ${MONTH_LABELS[date.getMonth()]}`;
}

const WEEKDAY_LABELS = [
  "Понедельник",
  "Вторник",
  "Среда",
  "Четверг",
  "Пятница",
  "Суббота",
  "Воскресенье",
];

export function formatWeekdayHuman(date: Date): string {
  return WEEKDAY_LABELS[isoWeekday(date)];
}

export function isHabitScheduledOnWeekday(habit: Habit, date: Date): boolean {
  return habit.frequency !== "weekdays" || isoWeekday(date) < 5;
}

/**
 * Активна ли привычка "сегодня": для weekly_n скрываем её, если недельная
 * квота уже выполнена (и сегодня она не отмечена).
 */
export function isHabitDueOn(
  habit: Habit,
  date: Date,
  doneDateKeysForHabit: Set<string>
): boolean {
  if (habit.frequency === "daily") return true;
  if (doneDateKeysForHabit.has(toDateKey(date))) return true;
  if (habit.frequency === "weekdays") return isoWeekday(date) < 5;

  const doneThisWeek = weekDateKeys(date).filter((key) =>
    doneDateKeysForHabit.has(key)
  ).length;
  return doneThisWeek < habit.weekly_target;
}
