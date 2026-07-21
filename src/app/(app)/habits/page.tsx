"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { HabitFormDialog } from "@/components/habits/habit-form-dialog";
import { HabitRow } from "@/components/habits/habit-row";
import { MAX_HABITS_RECOMMENDED } from "@/lib/constants";
import { useHabitsStore } from "@/store/habits-store";
import type { Habit } from "@/types";

export default function HabitsPage() {
  const habits = useHabitsStore((s) => s.habits);
  const logs = useHabitsStore((s) => s.logs);
  const loading = useHabitsStore((s) => s.loading);
  const loaded = useHabitsStore((s) => s.loaded);
  const archiveHabit = useHabitsStore((s) => s.archiveHabit);
  const deleteHabit = useHabitsStore((s) => s.deleteHabit);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingHabit, setEditingHabit] = React.useState<Habit | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Habit | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const active = habits.filter((h) => !h.is_archived);
  const archived = habits.filter((h) => h.is_archived);

  function openCreate() {
    setEditingHabit(null);
    setFormOpen(true);
  }

  function openEdit(habit: Habit) {
    setEditingHabit(habit);
    setFormOpen(true);
  }

  async function handleArchiveToggle(habit: Habit) {
    try {
      await archiveHabit(habit.id, !habit.is_archived);
      toast.success(habit.is_archived ? "Привычка восстановлена" : "Привычка архивирована");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось изменить");
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteHabit(pendingDelete.id);
      toast.success("Привычка удалена");
      setPendingDelete(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось удалить");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Привычки</h1>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {active.length} активных
            {active.length > MAX_HABITS_RECOMMENDED
              ? ` · рекомендуется ≤ ${MAX_HABITS_RECOMMENDED}`
              : ""}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Добавить
        </Button>
      </div>

      {loading && !loaded ? (
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : (
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Активные ({active.length})</TabsTrigger>
            <TabsTrigger value="archived">Архив ({archived.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {active.length === 0 ? (
              <p className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
                Активных привычек нет. Начните с 3–5.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {active.map((habit) => (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    logs={logs}
                    onEdit={() => openEdit(habit)}
                    onArchiveToggle={() => handleArchiveToggle(habit)}
                    onDelete={() => setPendingDelete(habit)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived">
            {archived.length === 0 ? (
              <p className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">
                Архив пуст.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {archived.map((habit) => (
                  <HabitRow
                    key={habit.id}
                    habit={habit}
                    logs={logs}
                    onEdit={() => openEdit(habit)}
                    onArchiveToggle={() => handleArchiveToggle(habit)}
                    onDelete={() => setPendingDelete(habit)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      <HabitFormDialog open={formOpen} onOpenChange={setFormOpen} habit={editingHabit} />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Удалить привычку?"
        description={`«${pendingDelete?.name}» и вся история выполнений будут удалены без возможности восстановления.`}
        confirmLabel="Удалить"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
