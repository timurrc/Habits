"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "@/store/auth-store";

export default function RootPage() {
  const status = useAuthStore((s) => s.status);
  const profile = useAuthStore((s) => s.profile);
  const router = useRouter();

  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    } else if (status === "authenticated") {
      router.replace(profile && !profile.onboarded ? "/onboarding" : "/today");
    }
  }, [status, profile, router]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
        GoodDay
      </p>
      <Loader2 className="size-4 animate-spin text-muted-foreground" />
    </div>
  );
}
