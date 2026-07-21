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

function SignupForm() {
  const signUpWithPassword = useAuthStore((s) => s.signUpWithPassword);
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [needsConfirmation, setNeedsConfirmation] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signUpWithPassword(email.trim(), password, name.trim());
      const authenticated = useAuthStore.getState().status === "authenticated";
      if (!authenticated) {
        setNeedsConfirmation(true);
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Не удалось зарегистрироваться"
      );
    } finally {
      setLoading(false);
    }
  }

  if (needsConfirmation) {
    return (
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>
          Письмо отправлено на{" "}
          <span className="text-foreground">{email}</span>.
        </p>
        <p>Подтверди адрес и войди.</p>
        <Link href="/login" className="inline-block text-foreground underline underline-offset-4">
          Ко входу
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Имя</Label>
        <Input
          id="name"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
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
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading} className="mt-1">
        {loading && <Loader2 className="size-4 animate-spin" />}
        Создать аккаунт
      </Button>
    </form>
  );
}

export default function SignupPage() {
  return (
    <RequireGuest>
      <AuthShell
        title="Регистрация"
        description="Выбери привычки и отмечай их каждый день."
        footer={
          <>
            Уже есть аккаунт?{" "}
            <Link href="/login" className="text-foreground underline underline-offset-4">
              Войти
            </Link>
          </>
        }
      >
        <SignupForm />
      </AuthShell>
    </RequireGuest>
  );
}
