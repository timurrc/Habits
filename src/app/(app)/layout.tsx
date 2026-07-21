"use client";

import { RequireAuth } from "@/components/auth/auth-gate";
import { AppShell } from "@/components/layout/app-shell";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
