"use client";

import * as React from "react";
import { Pause, Play } from "lucide-react";

/**
 * A ticker of the stack, in motion. Every item is also listed in the Stack
 * section, so the strip is decoration for assistive tech and hidden from it;
 * the pause control is outside that hidden region so it stays operable.
 *
 * With reduced motion the strip stops being a ticker: one copy of the list
 * wraps into rows, nothing is clipped, and there is nothing to pause.
 */
export function TechTicker({ items }: { items: readonly string[] }) {
  const [paused, setPaused] = React.useState(false);

  return (
    <div className="relative border-y border-border/70">
      <div aria-hidden className="relative flex overflow-hidden py-3">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-background to-transparent motion-reduce:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-background to-transparent motion-reduce:hidden" />
        <div
          data-paused={paused}
          className="flex min-w-full shrink-0 animate-marquee items-center gap-10 pr-10 hover:[animation-play-state:paused] data-[paused=true]:[animation-play-state:paused] motion-reduce:shrink motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:gap-x-8 motion-reduce:gap-y-3 motion-reduce:px-6 motion-reduce:pr-6"
        >
          {[0, 1].map((copy) =>
            items.map((item) => (
              <span
                key={`${copy}-${item}`}
                className={
                  "flex shrink-0 items-center gap-10 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground motion-reduce:gap-8" +
                  (copy === 1 ? " motion-reduce:hidden" : "")
                }
              >
                {item}
                <span className="text-brand/50 motion-reduce:hidden">/</span>
              </span>
            ))
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? "Play the tech ticker" : "Pause the tech ticker"}
        className="touch-target absolute right-3 top-1/2 z-20 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md border border-border/80 bg-background text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground motion-reduce:hidden"
      >
        {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
      </button>
    </div>
  );
}
