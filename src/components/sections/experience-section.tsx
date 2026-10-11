"use client";

import { Section } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { field, useLive } from "@/components/site/live-content";

/** Roles, live inside the editor so adding or reordering one shows at once. */
export function ExperienceSection() {
  const { roles, edit } = useLive();
  return (
    <Section
      id="experience"
      index="02"
      title="Experience"
      description="Five years of paid work, from freelance client builds to leading frontend architecture and writing the services behind it."
    >
      <ol className="relative border-l border-border/70 pl-6 sm:pl-10">
        {roles.map((role, index) => (
          <Reveal
            as="li"
            key={`${role.company}-${role.period}`}
            delay={index * 80}
            className="relative pb-14 last:pb-0"
          >
            {/* Timeline node */}
            <span
              aria-hidden
              className={
                role.current
                  ? "absolute left-[-26px] top-2 h-2.5 w-2.5 rounded-full bg-brand ring-4 ring-background sm:left-[-42px]"
                  : "absolute left-[-26px] top-2 h-2.5 w-2.5 rounded-full border border-border bg-background ring-4 ring-background sm:left-[-42px]"
              }
            />

            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <h3 className="text-lg font-medium tracking-tight">
                <span data-tina-field={field(edit, role, "title")}>{role.title}</span>
                <span className="text-muted-foreground">
                  {" · "}
                  <span data-tina-field={field(edit, role, "company")}>{role.company}</span>
                </span>
              </h3>
              <span
                className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                data-tina-field={field(edit, role, "period")}
              >
                {role.period}
              </span>
            </div>

            <p
              className="mt-1 font-mono text-[11px] text-muted-foreground"
              data-tina-field={field(edit, role, "location")}
            >
              {role.location}
            </p>

            <p
              className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground"
              data-tina-field={field(edit, role, "summary")}
            >
              {role.summary}
            </p>

            <ul className="mt-4 max-w-2xl space-y-2.5">
              {(role.points ?? []).map((point, i) => (
                <li
                  key={point}
                  className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="mt-[9px] h-px w-3 shrink-0 bg-brand/50" />
                  <span className="text-pretty" data-tina-field={field(edit, role, "points", i)}>
                    {point}
                  </span>
                </li>
              ))}
            </ul>

            <ul className="mt-5 flex flex-wrap gap-2">
              {(role.stack ?? []).map((tech, i) => (
                <li
                  key={tech}
                  data-tina-field={field(edit, role, "stack", i)}
                  className="rounded border border-border/80 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}
