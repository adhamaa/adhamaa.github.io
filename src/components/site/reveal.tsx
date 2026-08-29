"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Stagger in milliseconds. */
  delay?: number;
  /** Swing up out of depth instead of a flat fade. */
  depth?: boolean;
  as?: "div" | "section" | "li" | "article";
};

/**
 * Fades content in the first time it enters the viewport.
 * Renders visible immediately when IntersectionObserver is unavailable.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  depth = false,
  as: Tag = "div",
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={shown ? { animationDelay: `${delay}ms` } : undefined}
      className={cn(
        shown
          ? depth
            ? "animate-rise-3d"
            : "animate-fade-up"
          : "opacity-0 motion-reduce:opacity-100",
        className
      )}
    >
      {children}
    </Tag>
  );
}
