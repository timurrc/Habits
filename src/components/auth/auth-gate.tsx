"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";

type GuardKind = "guest" | "session" | "onboarded";

function Spinner() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
    </div>
  );
}

function useIsRouteReady(kind: GuardKind): boolean {
  const status = useAuthStore((s) => s.status);
  const profile = useAuthStore((s) => s.profile);
  const router = useRouter();
  const needsOnboarding =
    status === "authenticated" && !!profile && !profile.onboarded;

  React.useEffect(() => {
    if (kind === "guest") {
      if (status === "authenticated") {
        router.replace(needsOnboarding ? "/onboarding" : "/today");
      }
      return;
    }
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (kind === "onboarded" && needsOnboarding) {
      router.replace("/onboarding");
    }
  }, [kind, status, needsOnboarding, router]);

  if (kind === "guest") return status === "unauthenticated";
  if (status === "loading" || status === "unauthenticated") return false;
  return kind === "session" || !needsOnboarding;
}

export function RequireGuest({ children }: { children: React.ReactNode }) {
  return useIsRouteReady("guest") ? <>{children}</> : <Spinner />;
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  return useIsRouteReady("onboarded") ? <>{children}</> : <Spinner />;
}

export function RequireSession({ children }: { children: React.ReactNode }) {
  return useIsRouteReady("session") ? <>{children}</> : <Spinner />;
}
