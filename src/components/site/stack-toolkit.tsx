"use client";

import { listNumber } from "@/lib/utils";
import { field, useLive } from "@/components/site/live-content";

/** The About page's compact Stack Groups, live and click-to-edit in the editor. */
export function StackToolkit() {
  const { stackGroups, edit } = useLive();
  return (
    <div className="grid gap-px overflow-hidden rounded-lg border border-border/80 bg-border/60 sm:grid-cols-2">
      {stackGroups.map((group, index) => (
        <div key={group.title} className="bg-background p-5">
          <div className="mb-3 flex items-baseline justify-between">
            <h3 className="text-sm font-medium" data-tina-field={field(edit, group, "title")}>
              {group.title}
            </h3>
            <span className="font-mono text-[11px] text-brand">{listNumber(index)}</span>
          </div>
          <p
            className="font-mono text-xs leading-relaxed text-muted-foreground"
            data-tina-field={field(edit, group, "items")}
          >
            {(group.items ?? []).join(" · ")}
          </p>
        </div>
      ))}
    </div>
  );
}
