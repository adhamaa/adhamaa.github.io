"use client";

import * as React from "react";
import dynamic from "next/dynamic";

export const OPEN_COMMAND_MENU = "open-command-menu";

/** Opens the ⌘K palette from anywhere (used by the nav button). */
export function openCommandMenu() {
  window.dispatchEvent(new CustomEvent(OPEN_COMMAND_MENU));
}

// The palette is React Aria's autocomplete, menu and modal. None of it is
// needed to read the page, so it is fetched after load, not with it.
const loadMenu = () => import("@/components/site/command-menu");
const LazyCommandMenu = dynamic(
  () => loadMenu().then((module) => module.CommandMenu),
  { ssr: false }
);

/**
 * Owns the shortcut and the open state, and mounts the palette the first time
 * it is asked for. The chunk is warmed while the browser is idle, so by the time
 * anyone presses ⌘K it is almost always already in cache.
 */
export function CommandMenuLoader() {
  const [open, setOpen] = React.useState(false);
  const [requested, setRequested] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setRequested(true);
        setOpen((value) => !value);
      }
    };
    const onOpen = () => {
      setRequested(true);
      setOpen(true);
    };

    document.addEventListener("keydown", onKeyDown);
    window.addEventListener(OPEN_COMMAND_MENU, onOpen);

    const warm = () => void loadMenu();
    const idle =
      typeof window.requestIdleCallback === "function"
        ? window.requestIdleCallback(warm, { timeout: 4000 })
        : window.setTimeout(warm, 2000);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(OPEN_COMMAND_MENU, onOpen);
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idle);
      } else {
        window.clearTimeout(idle);
      }
    };
  }, []);

  return requested ? <LazyCommandMenu open={open} onOpenChange={setOpen} /> : null;
}
