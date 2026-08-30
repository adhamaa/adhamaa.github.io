"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { useScrollProgress } from "@/lib/scroll-motion";
import { pipeline } from "@/data/pipeline";

/** Transitions between layers; the section is one viewport taller than this. */
const SPAN = pipeline.length - 1;

/**
 * A pinned scroll section: the panel sticks to the viewport while the page
 * scrolls past it, and the layer stack scrubs through `pipeline`.
 *
 * The slab transforms are written straight onto the nodes from inside the rAF
 * pass — the maths (a signed distance either side of the read head) is past
 * what CSS `calc()` can express. Only the active index goes through React, so
 * this re-renders three times across the whole section rather than per frame.
 *
 * With motion turned off `onProgress` never fires, no inline styles are ever
 * written, and the stylesheet unpins the whole thing into a plain column.
 */
export function PipelineSection() {
  const slabs = React.useRef<Array<HTMLLIElement | null>>([]);
  const rail = React.useRef<HTMLSpanElement>(null);
  const [phase, setPhase] = React.useState(0);
  const shown = React.useRef(0);

  const ref = useScrollProgress<HTMLElement>({
    // Progress runs from the section's top hitting the viewport top until its
    // last viewport-worth of travel is used up — exactly the pinned stretch.
    start: 0,
    end: -SPAN,
    rest: 0,
    onProgress: (p) => {
      const head = p * SPAN;

      slabs.current.forEach((slab, index) => {
        if (!slab) return;

        // Signed distance from the read head: ahead is still coming, behind
        // has already flown past the camera.
        const d = index - head;
        const away = Math.abs(d);
        const z = -d * (d >= 0 ? 150 : 110);

        slab.style.transform = [
          `translate3d(0, ${(d * 62).toFixed(1)}px, ${z.toFixed(1)}px)`,
          `rotateX(${(d * -8).toFixed(2)}deg)`,
          `scale(${(1 - Math.min(away, 2) * 0.07).toFixed(3)})`,
        ].join(" ");
        // Steep falloff, plus depth of field: neighbours read as depth rather
        // than as a second column of text competing with the one in focus.
        slab.style.opacity = Math.max(
          0,
          1 - away * (d >= 0 ? 0.62 : 0.85)
        ).toFixed(3);
        slab.style.filter =
          away < 0.08 ? "none" : `blur(${Math.min(away * 3, 6).toFixed(1)}px)`;
        slab.style.zIndex = String(Math.round(100 + z / 10));
        slab.dataset.active = away < 0.5 ? "true" : "false";
      });

      if (rail.current) rail.current.style.transform = `scaleX(${p.toFixed(3)})`;

      const next = Math.min(SPAN, Math.max(0, Math.round(head)));
      if (next !== shown.current) {
        shown.current = next;
        setPhase(next);
      }
    },
  });

  return (
    <section
      ref={ref}
      id="slice"
      aria-labelledby="slice-heading"
      className="pin-section border-t border-border/70"
      style={{ "--screens": pipeline.length } as React.CSSProperties}
    >
      <div className="pin-viewport">
        <div className="container grid w-full items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="label">The whole slice</p>
            <h2
              id="slice-heading"
              className="mt-4 text-balance text-2xl font-semibold tracking-tight sm:text-4xl"
            >
              One feature, start to finish, without a handoff.
            </h2>

            <div className="pin-copy-deck mt-6 min-h-40 sm:min-h-34">
              {pipeline.map((layer, index) => (
                <article
                  key={layer.id}
                  className={cn("pin-copy", index === phase && "is-active")}
                >
                  <p className="font-mono text-xs text-brand">
                    {layer.id} — {layer.title.toLowerCase()},{" "}
                    <span className="text-muted-foreground/70">
                      {layer.kicker}
                    </span>
                  </p>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {layer.body}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-6 h-px w-full max-w-sm overflow-hidden bg-border">
              <span
                ref={rail}
                aria-hidden
                className="block h-full w-full origin-left scale-x-0 bg-brand"
              />
            </div>
          </div>

          <div className="pin-stage">
            <ol className="pin-stack h-64 sm:h-80">
              {pipeline.map((layer, index) => (
                <li
                  key={layer.id}
                  ref={(node) => {
                    slabs.current[index] = node;
                  }}
                  data-active={index === 0 ? "true" : "false"}
                  className="pin-slab rounded-xl border border-border/80 bg-card/80 p-6 shadow-2xl shadow-black/5 backdrop-blur-xs data-[active=true]:border-brand/50 dark:shadow-black/50 sm:p-7"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-lg font-medium tracking-tight sm:text-xl">
                      {layer.title}
                    </h3>
                    <span className="font-mono text-[11px] text-brand">
                      {layer.id}
                    </span>
                  </div>
                  <p className="label mt-1.5 normal-case tracking-normal">
                    {layer.kicker}
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {layer.items.map((item) => (
                      <li
                        key={item}
                        className="rounded border border-border/80 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
