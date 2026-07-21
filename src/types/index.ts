export type HabitFrequency = "daily" | "weekdays" | "weekly_n";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "anytime";

export const HABIT_COLORS = [
  "zinc",
  "red",
  "orange",
  "amber",
  "emerald",
  "teal",
  "sky",
  "violet",
  "pink",
] as const;

export type HabitColor = (typeof HABIT_COLORS)[number];

export interface HabitInput {
  name: string;
  icon: string;
  color: HabitColor;
  frequency: HabitFrequency;
  weekly_target: number;
  time_of_day: TimeOfDay;
}

export interface Habit extends HabitInput {
  id: string;
  user_id: string;
  sort_order: number;
  is_archived: boolean;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  done_date: string;
  created_at: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  timezone: string;
  strict_mode: boolean;
  onboarded: boolean;
  created_at: string;
}
