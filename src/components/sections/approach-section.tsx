import { Section } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { profile } from "@/data/profile";

export function ApproachSection() {
  return (
    <Section
      id="approach"
      index="04"
      title="How I work"
      description="The habits behind the work, and what currently has my attention."
    >
      <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:gap-16">
        <ol className="grid gap-px overflow-hidden rounded-lg border border-border/80 bg-border/60 sm:grid-cols-2">
          {profile.principles.map((principle, index) => (
            <Reveal
              as="li"
              key={principle.title}
              delay={index * 70}
              depth
              className="bg-background p-6"
            >
              <span className="font-mono text-[11px] text-brand">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-base font-medium tracking-tight">
                {principle.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
                {principle.body}
              </p>
            </Reveal>
          ))}
        </ol>

        <Reveal delay={120} depth>
          <div className="rounded-lg border border-border/80 p-6">
            <div className="mb-5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              <span className="label">Currently</span>
            </div>
            <ul className="space-y-4">
              {profile.now.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                >
                  <span className="mt-[7px] h-px w-4 shrink-0 bg-brand/50" />
                  <span className="text-pretty">{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-border/70 pt-4 font-mono text-[11px] text-muted-foreground/60">
              Updated {new Date().getFullYear()} · {profile.timezone}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
