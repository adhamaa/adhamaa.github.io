"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { prefersReducedMotion, useScrollProgress } from "@/lib/scroll-motion";

type Depth = {
  /** Degrees of X tilt at full depth. Positive leans the top away from you. */
  rotateX?: number;
  /** Degrees of Y tilt at full depth. */
  rotateY?: number;
  /** Vertical drift in px at full depth — this is the parallax knob. */
  translateY?: number;
  /** Push along the Z axis in px at full depth. Negative sends it backwards. */
  translateZ?: number;
  /** How much scale is shed at full depth. `0.06` bottoms out at 94%. */
  scale?: number;
  /** How much opacity is shed at full depth. */
  fade?: number;
};

type Scroll3DProps = Depth & {
  children: React.ReactNode;
  className?: string;
  /** Class for the transformed layer, e.g. to round its corners for the GPU. */
  layerClassName?: string;
  /**
   * `enter` rises out of depth and settles flat as it scrolls in.
   * `exit` starts flat and recedes as it scrolls away.
   */
  mode?: "enter" | "exit";
  /** Viewport fraction where the travel begins. See `useScrollProgress`. */
  start?: number;
  /** Viewport fraction where the travel ends. */
  end?: number;
  /** Camera distance. Smaller is a wider, more dramatic lens. */
  perspective?: number;
  as?: "div" | "section" | "li" | "article" | "figure";
};

const MODE_DEFAULTS = {
  enter: { start: 0.95, end: 0.45, rest: 1, initial: 0 },
  exit: { start: 0.2, end: -0.5, rest: 0, initial: 0 },
} as const;

/**
 * Moves its children through 3D space as the page scrolls.
 *
 * The wrapper holds the camera and is what gets measured; the inner layer
 * carries the transform so measurement never feeds back into itself.
 */
export function Scroll3D({
  children,
  className,
  layerClassName,
  mode = "enter",
  start,
  end,
  perspective = 1200,
  rotateX = 0,
  rotateY = 0,
  translateY = 0,
  translateZ = 0,
  scale = 0,
  fade = 0,
  as: Tag = "div",
}: Scroll3DProps) {
  const defaults = MODE_DEFAULTS[mode];
  const ref = useScrollProgress<HTMLDivElement>(
    { start: start ?? defaults.start, end: end ?? defaults.end },
    defaults.rest
  );

  return (
    <Tag
      ref={ref as never}
      className={cn("scene-3d", className)}
      style={
        {
          "--perspective": `${perspective}px`,
          "--p": defaults.initial,
        } as React.CSSProperties
      }
    >
      <div
        data-mode={mode}
        className={cn("layer-3d", layerClassName)}
        style={
          {
            "--rx": rotateX,
            "--ry": rotateY,
            "--ty": translateY,
            "--tz": translateZ,
            "--ds": scale,
            "--do": fade,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </Tag>
  );
}

type Tilt3DProps = {
  children: React.ReactNode;
  className?: string;
  layerClassName?: string;
  /** Peak rotation in degrees at the edges of the element. */
  strength?: number;
  perspective?: number;
};

/**
 * Leans its children toward the pointer. Inert on touch and reduced motion —
 * a tilt nobody can aim is just a jitter.
 */
export function Tilt3D({
  children,
  className,
  layerClassName,
  strength = 6,
  perspective = 1000,
}: Tilt3DProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    setEnabled(
      !prefersReducedMotion() &&
        typeof window.matchMedia === "function" &&
        window.matchMedia("(hover: hover) and (pointer: fine)").matches
    );
  }, []);

  const handleMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el || !enabled) return;
      const rect = el.getBoundingClientRect();
      const mx = (event.clientX - rect.left) / rect.width - 0.5;
      const my = (event.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--mx", (mx * 2).toFixed(3));
      el.style.setProperty("--my", (my * 2).toFixed(3));
    },
    [enabled]
  );

  const handleLeave = React.useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "0");
    el.style.setProperty("--my", "0");
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={enabled ? handleMove : undefined}
      onPointerLeave={enabled ? handleLeave : undefined}
      className={cn("scene-3d", className)}
      style={{ "--perspective": `${perspective}px` } as React.CSSProperties}
    >
      <div
        className={cn("tilt-3d", layerClassName)}
        style={{ "--tilt": strength } as React.CSSProperties}
      >
        {children}
      </div>
    </div>
  );
}
