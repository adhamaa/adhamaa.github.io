import { Section } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { stack } from "@/data/stack";

export function StackSection() {
  return (
    <Section
      id="stack"
      index="03"
      title="Stack"
      description="The tools behind the systems above — not a checklist of everything I have read the docs for."
    >
      <div className="grid gap-px overflow-hidden rounded-lg border border-border/80 bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
        {stack.map((group, index) => (
          <Reveal
            key={group.id}
            delay={index * 70}
            depth
            className="flex flex-col bg-background p-6"
          >
            <div className="mb-5 flex items-baseline justify-between gap-2">
              <h3 className="text-sm font-medium tracking-tight">
                {group.title}
              </h3>
              <span className="font-mono text-[11px] text-brand">
                {group.id}
              </span>
            </div>
            <p className="label mb-5 normal-case tracking-normal">
              {group.note}
            </p>
            <ul className="space-y-2.5">
              {group.items.map((item) => (
                <li
                  key={item}
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
