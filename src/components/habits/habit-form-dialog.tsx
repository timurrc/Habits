"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  FREQUENCY_LABELS,
  HABIT_COLOR_CLASSES,
  HABIT_ICON_CHOICES,
  TIME_OF_DAY_LABELS,
} from "@/lib/constants";
import { HABIT_COLORS, type Habit, type HabitFrequency, type HabitInput, type TimeOfDay } from "@/types";
import { useAuthStore } from "@/store/auth-store";
import { useHabitsStore } from "@/store/habits-store";

const DEFAULT_INPUT: HabitInput = {
  name: "",
  icon: "·",
  color: "teal",
  frequency: "daily",
  weekly_target: 7,
  time_of_day: "anytime",
};

export function HabitFormDialog({
  open,
  onOpenChange,
  habit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
}) {
  const user = useAuthStore((s) => s.user);
  const addHabit = useHabitsStore((s) => s.addHabit);
  const updateHabit = useHabitsStore((s) => s.updateHabit);

  const [form, setForm] = React.useState<HabitInput>(DEFAULT_INPUT);
  const [saving, setSaving] = React.useState(false);
  const isEditing = Boolean(habit);

  React.useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- сбрасываем форму на актуальные данные при каждом открытии диалога
      setForm(
        habit
          ? {
              name: habit.name,
              icon: habit.icon,
              color: habit.color,
              frequency: habit.frequency,
              weekly_target: habit.weekly_target,
              time_of_day: habit.time_of_day,
            }
          : DEFAULT_INPUT
      );
    }
  }, [open, habit]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim()) {
      toast.error("Введите название привычки");
      return;
    }
    setSaving(true);
    try {
      if (isEditing && habit) {
        await updateHabit(habit.id, form);
        toast.success("Привычка обновлена");
      } else {
        await addHabit(user.id, form);
        toast.success("Привычка добавлена");
      }
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Изменить" : "Новая привычка"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="habit-name">Название</Label>
            <Input
              id="habit-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Например: Заправить кровать"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Иконка</Label>
            <div className="flex flex-wrap gap-1.5">
              {HABIT_ICON_CHOICES.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, icon }))}
                  className={cn(
                    "flex size-8 items-center justify-center border font-mono text-sm transition-colors",
                    form.icon === icon
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-accent"
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Цвет</Label>
            <div className="flex flex-wrap gap-1.5">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  onClick={() => setForm((f) => ({ ...f, color }))}
                  className={cn(
                    "size-6 ring-offset-2 ring-offset-background transition-all",
                    HABIT_COLOR_CLASSES[color].dot,
                    form.color === color ? "ring-2 ring-foreground" : ""
                  )}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Частота</Label>
              <Select
                value={form.frequency}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, frequency: v as HabitFrequency }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FREQUENCY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Время дня</Label>
              <Select
                value={form.time_of_day}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, time_of_day: v as TimeOfDay }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIME_OF_DAY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.frequency === "weekly_n" && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="weekly-target">Раз в неделю</Label>
              <Input
                id="weekly-target"
                type="number"
                min={1}
                max={7}
                value={form.weekly_target}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    weekly_target: Math.min(7, Math.max(1, Number(e.target.value) || 1)),
                  }))
                }
              />
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Сохранить" : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
