import type { HabitColor, HabitInput } from "@/types";

export const MAX_HABITS_RECOMMENDED = 5;

export interface StarterHabit extends HabitInput {
  recommended: boolean;
}

export const STARTER_HABITS: StarterHabit[] = [
  {
    name: "Заправить кровать",
    icon: "·",
    color: "teal",
    frequency: "daily",
    weekly_target: 7,
    time_of_day: "morning",
    recommended: true,
  },
  {
    name: "Почистить зубы утром",
    icon: "·",
    color: "teal",
    frequency: "daily",
    weekly_target: 7,
    time_of_day: "morning",
    recommended: true,
  },
  {
    name: "Без ленты 10 минут после подъёма",
    icon: "·",
    color: "red",
    frequency: "daily",
    weekly_target: 7,
    time_of_day: "morning",
    recommended: true,
  },
  {
    name: "Главная задача дня",
    icon: "·",
    color: "emerald",
    frequency: "daily",
    weekly_target: 7,
    time_of_day: "morning",
    recommended: true,
  },
  {
    name: "Работа 25 минут",
    icon: "·",
    color: "emerald",
    frequency: "daily",
    weekly_target: 7,
    time_of_day: "anytime",
    recommended: true,
  },
  {
    name: "Стакан воды",
    icon: "·",
    color: "sky",
    frequency: "daily",
    weekly_target: 7,
    time_of_day: "morning",
    recommended: false,
  },
  {
    name: "Зубы вечером",
    icon: "·",
    color: "teal",
    frequency: "daily",
    weekly_target: 7,
    time_of_day: "evening",
    recommended: false,
  },
  {
    name: "Движение 10 минут",
    icon: "·",
    color: "orange",
    frequency: "daily",
    weekly_target: 7,
    time_of_day: "anytime",
    recommended: false,
  },
  {
    name: "Запись о дне",
    icon: "·",
    color: "amber",
    frequency: "daily",
    weekly_target: 7,
    time_of_day: "evening",
    recommended: false,
  },
];

export const HABIT_ICON_CHOICES = [
  "·",
  "✓",
  "1",
  "2",
  "3",
  "A",
  "B",
  "○",
  "●",
  "△",
  "□",
  "+",
  "→",
  "↑",
  "※",
  "✦",
];

export const HABIT_COLOR_CLASSES: Record<
  HabitColor,
  { bg: string; text: string; dot: string; bar: string }
> = {
  zinc: {
    bg: "bg-zinc-500/10",
    text: "text-zinc-700 dark:text-zinc-300",
    dot: "bg-zinc-500",
    bar: "bg-zinc-500",
  },
  red: {
    bg: "bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    dot: "bg-red-500",
    bar: "bg-red-500",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-700 dark:text-orange-400",
    dot: "bg-orange-500",
    bar: "bg-orange-500",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    dot: "bg-emerald-600",
    bar: "bg-emerald-600",
  },
  teal: {
    bg: "bg-teal-500/10",
    text: "text-teal-800 dark:text-teal-300",
    dot: "bg-teal-700",
    bar: "bg-teal-700",
  },
  sky: {
    bg: "bg-sky-500/10",
    text: "text-sky-700 dark:text-sky-400",
    dot: "bg-sky-600",
    bar: "bg-sky-600",
  },
  violet: {
    bg: "bg-stone-500/10",
    text: "text-stone-700 dark:text-stone-300",
    dot: "bg-stone-600",
    bar: "bg-stone-600",
  },
  pink: {
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-400",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
};

export function isHabitColor(value: string): value is HabitColor {
  return (
    value === "zinc" ||
    value === "red" ||
    value === "orange" ||
    value === "amber" ||
    value === "emerald" ||
    value === "teal" ||
    value === "sky" ||
    value === "violet" ||
    value === "pink"
  );
}

export const TIME_OF_DAY_LABELS: Record<string, string> = {
  morning: "утро",
  afternoon: "день",
  evening: "вечер",
  anytime: "когда угодно",
};

export const FREQUENCY_LABELS: Record<string, string> = {
  daily: "каждый день",
  weekdays: "будни",
  weekly_n: "N раз в неделю",
};
