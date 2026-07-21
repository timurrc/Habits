"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { RequireSession } from "@/components/auth/auth-gate";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MAX_HABITS_RECOMMENDED, STARTER_HABITS } from "@/lib/constants";
import { useAuthStore } from "@/store/auth-store";
import { useHabitsStore } from "@/store/habits-store";

function OnboardingContent() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const markOnboarded = useAuthStore((s) => s.markOnboarded);
  const addHabit = useHabitsStore((s) => s.addHabit);

  const [selected, setSelected] = React.useState<number[]>(() =>
    STARTER_HABITS.flatMap((habit, idx) => (habit.recommended ? [idx] : [])),
  );
  const [saving, setSaving] = React.useState(false);

  function toggle(idx: number) {
    setSelected((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
    );
  }

  async function handleContinue(overrideSelection?: number[]) {
    if (!user) return;
    const habitsToCreate = overrideSelection ?? selected;
    setSaving(true);
    try {
      for (const idx of habitsToCreate) {
        const { recommended: _, ...input } = STARTER_HABITS[idx];
        await addHabit(user.id, input);
      }
      await markOnboarded();
      router.replace("/today");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  const over = selected.length > MAX_HABITS_RECOMMENDED;

  return (
    <div className="mx-auto flex min-h-svh max-w-lg flex-col px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-primary">
          Habbits
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Что берёшь в работу
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          До {MAX_HABITS_RECOMMENDED} на старте. Остальное — потом.
        </p>
      </motion.div>

      <ul className="mt-8 divide-y divide-border border-y border-border">
        {STARTER_HABITS.map((habit, idx) => {
          const isSelected = selected.includes(idx);
          return (
            <li key={habit.name}>
              <button
                type="button"
                onClick={() => toggle(idx)}
                className={cn(
                  "flex w-full items-center gap-3 py-3.5 text-left transition-colors",
                  isSelected ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center border",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border",
                  )}
                >
                  {isSelected && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span className="flex-1 text-sm font-medium text-foreground">
                  {habit.name}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                  {habit.time_of_day === "anytime" ? "" : habit.time_of_day}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-0 mt-auto border-t border-border bg-background/95 py-4 backdrop-blur">
        <p
          className={cn(
            "mb-3 font-mono text-xs",
            over
              ? "text-amber-700 dark:text-amber-400"
              : "text-muted-foreground",
          )}
        >
          {selected.length} выбрано
          {over ? ` · лучше ≤ ${MAX_HABITS_RECOMMENDED}` : ""}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={saving}
            onClick={() => handleContinue([])}
          >
            Пропустить
          </Button>
          <Button
            className="flex-1"
            disabled={saving || selected.length === 0}
            onClick={() => handleContinue()}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Дальше
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <RequireSession>
      <OnboardingContent />
    </RequireSession>
  );
}
