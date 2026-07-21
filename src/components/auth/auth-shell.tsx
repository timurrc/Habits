"use client";

import * as React from "react";
import { motion } from "framer-motion";

export function AuthShell({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col justify-center px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="mx-auto w-full max-w-sm"
      >
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
          GoodDay
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>

        <div className="mt-8 space-y-4">{children}</div>

        {footer && (
          <p className="mt-8 text-sm text-muted-foreground">{footer}</p>
        )}
      </motion.div>
    </div>
  );
}
