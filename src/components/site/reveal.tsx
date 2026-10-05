"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/scroll-motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger in milliseconds. */
  delay?: number;
  /** Swing up out of depth instead of a flat fade. */
  depth?: boolean;
  /**
   * Above the fold: animate on load from the server-rendered markup, with no
   * script involved. Everything else is visible until script has measured it.
   */
  eager?: boolean;
  as?: "div" | "section" | "li" | "article";
};

/**
 * visible: what the server renders, and what stays if script never runs or the
 *          element is already on screen when it does.
 * armed:   below the fold, held back until it scrolls in.
 * shown:   scrolled in; plays the entrance once.
 */
type Phase = "visible" | "armed" | "shown";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/**
 * Fades content in the first time it scrolls into view.
 *
 * Content is never hidden in the server markup: a slow or failed script leaves
 * the page readable, and the hero's entrance is plain CSS. Only elements script
 * has measured as below the fold are held back, which is invisible to the
 * visitor because it happens before first paint.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  depth = false,
  eager = false,
  as: Tag = "div",
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [phase, setPhase] = React.useState<Phase>("visible");

  useIsomorphicLayoutEffect(() => {
    if (eager) return;
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined" || prefersReducedMotion()) {
      return;
    }

    const rect = node.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) return;

    setPhase("armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase("shown");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [eager]);

  const animated = eager || phase === "shown";

  return (
    <Tag
      ref={ref as never}
      style={animated ? { animationDelay: `${delay}ms` } : undefined}
      className={cn(
        animated && (depth ? "animate-rise-3d" : "animate-fade-up"),
        phase === "armed" && "opacity-0",
        className
      )}
    >
      {children}
    </Tag>
  );
}
