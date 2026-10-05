"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { themeColors } from "@/lib/theme-colors";

/**
 * Keeps the browser's address-bar colour in step with the theme the page is
 * actually showing. A `prefers-color-scheme` media query on the meta tag would
 * follow the OS instead, which disagrees with the site whenever the visitor
 * toggles, or when the default (dark) differs from a light OS.
 */
export function ThemeColor() {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    if (!resolvedTheme) return;
    const color = resolvedTheme === "light" ? themeColors.light : themeColors.dark;
    document
      .querySelectorAll('meta[name="theme-color"]')
      .forEach((meta) => meta.setAttribute("content", color));
  }, [resolvedTheme]);

  return null;
}
