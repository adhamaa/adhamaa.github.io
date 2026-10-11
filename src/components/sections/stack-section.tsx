"use client";

import { listNumber } from "@/lib/utils";
import { Section } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { field, useLive } from "@/components/site/live-content";

/** Stack Groups, live inside the editor so adding or reordering one shows at once. */
export function StackSection() {
  const { stackGroups, edit } = useLive();
  return (
    <Section
      id="stack"
      index="03"
      title="Stack"
      description="The tools behind the systems above — not a checklist of everything I have read the docs for."
    >
      <div className="grid gap-px overflow-hidden rounded-lg border border-border/80 bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
        {stackGroups.map((group, index) => (
          <Reveal
            key={group.title}
            delay={index * 70}
            depth
            className="flex flex-col bg-background p-6"
          >
            <div className="mb-5 flex items-baseline justify-between gap-2">
              <h3
                className="text-sm font-medium tracking-tight"
                data-tina-field={field(edit, group, "title")}
              >
                {group.title}
              </h3>
              <span className="font-mono text-[11px] text-brand">
                {listNumber(index)}
              </span>
            </div>
            <p
              className="label mb-5 normal-case tracking-normal"
              data-tina-field={field(edit, group, "note")}
            >
              {group.note}
            </p>
            <ul className="space-y-2.5">
              {(group.items ?? []).map((item, i) => (
                <li
                  key={item}
                  data-tina-field={field(edit, group, "items", i)}
                  className="group flex items-center gap-2 font-mono text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  <span className="text-brand/40 transition-colors group-hover:text-brand">
                    ›
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
