"use client";

import * as React from "react";

/**
 * Scroll-driven motion engine.
 *
 * Registered elements get a `--p` custom property (0 → 1) written straight onto
 * their style during a single shared rAF pass. Nothing re-renders in React, so
 * the transforms that read `--p` stay on the compositor.
 */

export type ScrollProgressOptions = {
  /** `--p` is 0 while the element top sits at this fraction of the viewport height. */
  start?: number;
  /** `--p` is 1 once the element top reaches this fraction of the viewport height. */
  end?: number;
  /**
   * The value to pin when motion is turned off — whichever end of the range is
   * the element's undisturbed, neutral state.
   */
  rest?: number;
  /**
   * Called with every change, inside the rAF pass. For motion that CSS `calc()`
   * cannot express; keep it cheap and write styles, not state.
   */
  onProgress?: (p: number) => void;
};

type Target = {
  start: number;
  end: number;
  last: number;
  onProgress?: (p: number) => void;
};

const targets = new Map<HTMLElement, Target>();
let frame = 0;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

function measure() {
  frame = 0;
  const viewport = window.innerHeight || 1;

  targets.forEach((target, el) => {
    const top = el.getBoundingClientRect().top / viewport;
    const span = target.start - target.end || 1;
    const p = clamp01((target.start - top) / span);

    // Skip sub-pixel churn; the style write is the expensive part.
    if (Math.abs(p - target.last) < 0.001) return;
    target.last = p;
    el.style.setProperty("--p", p.toFixed(3));
    target.onProgress?.(p);
  });
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(measure);
}

function toggleListeners(on: boolean) {
  const method = on ? "addEventListener" : "removeEventListener";
  window[method]("scroll", schedule, { passive: true } as AddEventListenerOptions);
  window[method]("resize", schedule);
  window[method]("orientationchange", schedule);
}

/** Registers an element and returns its cleanup. */
export function trackScrollProgress(
  el: HTMLElement,
  start: number,
  end: number,
  onProgress?: (p: number) => void
) {
  if (!targets.size) toggleListeners(true);
  targets.set(el, { start, end, last: Number.NaN, onProgress });
  measure();

  return () => {
    targets.delete(el);
    el.style.removeProperty("--p");
    if (!targets.size) {
      toggleListeners(false);
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    }
  };
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** A tilt nobody can aim is just a jitter: it needs a fine pointer that hovers. */
export function canAimATilt() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    !prefersReducedMotion() &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/**
 * Drives `--p` on the returned ref as the element travels the viewport.
 *
 * When motion is off the element is pinned at `rest` and `onProgress` never
 * fires, so anything it would have driven falls back to plain stylesheet rules.
 */
export function useScrollProgress<T extends HTMLElement>({
  start = 0.95,
  end = 0.45,
  rest = 1,
  onProgress,
}: ScrollProgressOptions = {}) {
  const ref = React.useRef<T>(null);

  // Kept in a ref so callers need not memoise the callback. Assigned in a
  // layout effect rather than during render: mutating a ref while rendering is
  // unsafe once React may re-run or abandon a render.
  const handler = React.useRef(onProgress);
  useIsomorphicLayoutEffect(() => {
    handler.current = onProgress;
  });

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion() || typeof requestAnimationFrame === "undefined") {
      el.style.setProperty("--p", String(rest));
      return;
    }

    return trackScrollProgress(el, start, end, (p) => handler.current?.(p));
  }, [start, end, rest]);

  return ref;
}
