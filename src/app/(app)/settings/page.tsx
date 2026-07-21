"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/store/auth-store";
import { useHabitsStore } from "@/store/habits-store";

export default function SettingsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);
  const updateDisplayName = useAuthStore((s) => s.updateDisplayName);
  const setStrictMode = useAuthStore((s) => s.setStrictMode);
  const reset = useHabitsStore((s) => s.reset);
  const { resolvedTheme, setTheme } = useTheme();

  const [name, setName] = React.useState(profile?.display_name ?? "");
  const [savingName, setSavingName] = React.useState(false);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync draft with profile
    setName(profile?.display_name ?? "");
  }, [profile?.display_name]);

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    setSavingName(true);
    try {
      await updateDisplayName(name.trim());
      toast.success("Сохранено");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSavingName(false);
    }
  }

  async function handleSignOut() {
    reset();
    await signOut();
    router.replace("/login");
  }

  return (
    <div className="flex flex-col gap-10 px-4">
      <h1 className="text-3xl font-semibold tracking-tight">Настройки</h1>

      <section className="space-y-4 border-y border-border py-6">
        <div>
          <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Профиль
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
        </div>
        <form onSubmit={handleSaveName} className="flex items-end gap-2">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="display-name">Имя</Label>
            <Input
              id="display-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={savingName}>
            {savingName && <Loader2 className="size-4 animate-spin" />}
            Сохранить
          </Button>
        </form>
      </section>

      <section className="space-y-4 border-b border-border pb-6">
        <h2 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Поведение
        </h2>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Жёсткий режим</p>
            <p className="text-xs text-muted-foreground">
              Пропуск дня сбрасывает стрик
            </p>
          </div>
          <Switch
            checked={profile?.strict_mode ?? true}
            onCheckedChange={(checked) => void setStrictMode(checked)}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Тёмная тема</p>
          </div>
          <Switch
            checked={resolvedTheme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>
      </section>

      <Button variant="outline" className="w-full" onClick={handleSignOut}>
        <LogOut className="size-4" />
        Выйти
      </Button>
    </div>
  );
}
