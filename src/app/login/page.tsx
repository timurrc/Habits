"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { RequireGuest } from "@/components/auth/auth-gate";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";

function LoginForm() {
  const signInWithPassword = useAuthStore((s) => s.signInWithPassword);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithPassword(email.trim(), password);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось войти");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Пароль</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading} className="mt-1">
        {loading && <Loader2 className="size-4 animate-spin" />}
        Войти
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <RequireGuest>
      <AuthShell
        title="Вход"
        description="Продолжи отмечать привычки."
        footer={
          <>
            Нет аккаунта?{" "}
            <Link href="/signup" className="text-foreground underline underline-offset-4">
              Регистрация
            </Link>
          </>
        }
      >
        <LoginForm />
      </AuthShell>
    </RequireGuest>
  );
}
