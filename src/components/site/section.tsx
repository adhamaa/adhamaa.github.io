import * as React from "react";
import { cn } from "@/lib/utils";

type SectionProps = {
  id: string;
  index: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

/** Section shell: anchor target, monospace index, hairline rule, content. */
export function Section({
  id,
  index,
  title,
  description,
  children,
  className,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("scroll-mt-24 border-t border-border/70 py-20 sm:py-28", className)}
    >
      <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-xs text-brand">{index}</span>
          <h2 id={`${id}-title`} className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
        </div>
        {description ? (
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground text-pretty">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
