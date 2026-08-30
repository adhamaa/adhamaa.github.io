import { Section } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { experience } from "@/data/experience";

export function ExperienceSection() {
  return (
    <Section
      id="experience"
      index="02"
      title="Experience"
      description="Five years of paid work, from freelance client builds to leading frontend architecture and writing the services behind it."
    >
      <ol className="relative border-l border-border/70 pl-6 sm:pl-10">
        {experience.map((role, index) => (
          <Reveal
            as="li"
            key={role.id}
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
                {role.title}
                <span className="text-muted-foreground"> · {role.company}</span>
              </h3>
              <span className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
                {role.period}
              </span>
            </div>

            <p className="mt-1 font-mono text-[11px] text-muted-foreground/60">
              {role.location}
            </p>

            <p className="mt-4 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
              {role.summary}
            </p>

            <ul className="mt-4 max-w-2xl space-y-2.5">
              {role.points.map((point) => (
                <li
                  key={point}
                  className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="mt-[9px] h-px w-3 shrink-0 bg-brand/50" />
                  <span className="text-pretty">{point}</span>
                </li>
              ))}
            </ul>

            <ul className="mt-5 flex flex-wrap gap-2">
              {role.stack.map((tech) => (
                <li
                  key={tech}
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
