"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useClientValue } from "@/lib/use-client-value";

/** Compact light/dark switch. Renders a stable shell until mounted. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useClientValue(() => true, false);

  // Stay theme-agnostic until mounted so the server and client markup agree.
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={
        mounted
          ? isDark
            ? "Switch to light theme"
            : "Switch to dark theme"
          : "Toggle theme"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/80 text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground",
        className
      )}
    >
      {mounted ? (
        isDark ? (
          <Moon className="h-[15px] w-[15px]" />
        ) : (
          <Sun className="h-[15px] w-[15px]" />
        )
      ) : (
        <span className="h-[15px] w-[15px]" />
      )}
    </button>
  );
}
