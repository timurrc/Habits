import { create } from "zustand";
import { toast } from "sonner";

import { isHabitColor } from "@/lib/constants";
import { todayKey } from "@/lib/dates";
import { createClient } from "@/lib/supabase/client";
import type { HabitRow } from "@/lib/supabase/database.types";
import type { Habit, HabitFrequency, HabitInput, HabitLog, TimeOfDay } from "@/types";

function normalizeHabit(row: HabitRow): Habit {
  return {
    ...row,
    color: isHabitColor(row.color) ? row.color : "zinc",
    frequency: row.frequency as HabitFrequency,
    time_of_day: row.time_of_day as TimeOfDay,
  };
}

interface HabitsState {
  habits: Habit[];
  logs: HabitLog[];
  loading: boolean;
  loaded: boolean;

  fetchAll: (userId: string) => Promise<void>;
  addHabit: (userId: string, input: HabitInput) => Promise<void>;
  updateHabit: (habitId: string, input: Partial<HabitInput>) => Promise<void>;
  archiveHabit: (habitId: string, archived: boolean) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  toggleLog: (userId: string, habitId: string, dateKey?: string) => Promise<void>;
  reset: () => void;
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  logs: [],
  loading: false,
  loaded: false,

  fetchAll: async (userId) => {
    set({ loading: true });
    const supabase = createClient();

    const [habitsRes, logsRes] = await Promise.all([
      supabase
        .from("habits")
        .select("*")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true }),
      supabase.from("habit_logs").select("*").eq("user_id", userId),
    ]);

    if (habitsRes.error || logsRes.error) {
      toast.error("Не удалось загрузить привычки");
      set({ loading: false, loaded: true });
      return;
    }

    set({
      habits: (habitsRes.data ?? []).map(normalizeHabit),
      logs: logsRes.data ?? [],
      loading: false,
      loaded: true,
    });
  },

  addHabit: async (userId, input) => {
    const supabase = createClient();
    const maxOrder = get().habits.reduce((max, h) => Math.max(max, h.sort_order), -1);

    const { data, error } = await supabase
      .from("habits")
      .insert({ user_id: userId, ...input, sort_order: maxOrder + 1 })
      .select("*")
      .single();

    if (error) throw error;
    set((s) => ({ habits: [...s.habits, normalizeHabit(data)] }));
  },

  updateHabit: async (habitId, input) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("habits")
      .update(input)
      .eq("id", habitId)
      .select("*")
      .single();

    if (error) throw error;
    set((s) => ({
      habits: s.habits.map((h) => (h.id === habitId ? normalizeHabit(data) : h)),
    }));
  },

  archiveHabit: async (habitId, archived) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("habits")
      .update({ is_archived: archived })
      .eq("id", habitId);

    if (error) throw error;
    set((s) => ({
      habits: s.habits.map((h) =>
        h.id === habitId ? { ...h, is_archived: archived } : h
      ),
    }));
  },

  deleteHabit: async (habitId) => {
    const supabase = createClient();
    const { error } = await supabase.from("habits").delete().eq("id", habitId);

    if (error) throw error;
    set((s) => ({
      habits: s.habits.filter((h) => h.id !== habitId),
      logs: s.logs.filter((l) => l.habit_id !== habitId),
    }));
  },

  toggleLog: async (userId, habitId, dateKey) => {
    const key = dateKey ?? todayKey();
    const supabase = createClient();
    const existing = get().logs.find(
      (l) => l.habit_id === habitId && l.done_date === key
    );

    if (existing) {
      set((s) => ({ logs: s.logs.filter((l) => l.id !== existing.id) }));
      const { error } = await supabase.from("habit_logs").delete().eq("id", existing.id);
      if (error) {
        set((s) => ({ logs: [...s.logs, existing] }));
        toast.error("Не удалось обновить привычку");
      }
      return;
    }

    const optimisticId = `optimistic-${habitId}-${key}`;
    const optimisticLog: HabitLog = {
      id: optimisticId,
      habit_id: habitId,
      user_id: userId,
      done_date: key,
      created_at: new Date().toISOString(),
    };
    set((s) => ({ logs: [...s.logs, optimisticLog] }));

    const { data, error } = await supabase
      .from("habit_logs")
      .insert({ habit_id: habitId, user_id: userId, done_date: key })
      .select("*")
      .single();

    if (error) {
      set((s) => ({ logs: s.logs.filter((l) => l.id !== optimisticId) }));
      toast.error("Не удалось обновить привычку");
      return;
    }

    set((s) => ({
      logs: s.logs.map((l) => (l.id === optimisticId ? data : l)),
    }));
  },

  reset: () => set({ habits: [], logs: [], loading: false, loaded: false }),
}));
