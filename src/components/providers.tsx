"use client";

import * as React from "react";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/auth-store";

function AuthInitializer() {
  const init = useAuthStore((s) => s.init);
  React.useEffect(() => {
    void init();
  }, [init]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthInitializer />
      {children}
      <Toaster />
    </ThemeProvider>
  );
}
