import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Section } from "@/components/site/section";
import { Reveal } from "@/components/site/reveal";
import { Scroll3D, Tilt3D } from "@/components/site/scroll-3d";
import { GitHubIcon } from "@/components/site/icons";
import { projects, type Project } from "@/data/projects";

const statusStyles: Record<Project["status"], string> = {
  active: "border-brand/40 text-brand",
  shipped: "border-border text-muted-foreground",
  archived: "border-border/60 text-muted-foreground/60",
};

function ProjectLinks({ project }: { project: Project }) {
  const linkClass =
    "inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground";

  return (
    <div className="flex flex-row items-start gap-4 md:flex-col md:items-end md:gap-3">
      <span
        className={cn(
          "rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
          statusStyles[project.status]
        )}
      >
        {project.status}
      </span>

      {project.live ? (
        project.live.startsWith("/") ? (
          <Link href={project.live} className={linkClass}>
            visit
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        ) : (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            visit
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        )
      ) : null}

      {project.repo ? (
        <a
          href={project.repo}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          <GitHubIcon className="h-3.5 w-3.5" />
          source
        </a>
      ) : null}
    </div>
  );
}

export function WorkSection() {
  return (
    <Section
      id="work"
      index="01"
      title="Selected work"
      description="Independent products of mine — not my employer's. Live systems people use to run a business and see patients, each built solo from schema to interface to deploy."
    >
      <ul className="border-t border-border/70">
        {projects.map((project, index) => (
          <Reveal
            as="li"
            key={project.id}
            delay={index * 80}
            depth
            className="group border-b border-border/70"
          >
            <div className="grid gap-6 py-10 transition-colors md:grid-cols-[5rem_1fr_9rem] md:gap-10 md:group-hover:bg-muted/20">
              <div className="flex items-center gap-3 font-mono text-xs md:flex-col md:items-start md:gap-1">
                <span className="text-brand">{project.id}</span>
                <span className="text-muted-foreground/60">{project.year}</span>
              </div>

              <div className="min-w-0 max-w-2xl">
                <h3 className="text-xl font-medium tracking-tight transition-colors group-hover:text-brand sm:text-2xl">
                  {project.name}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {project.kicker}
                </p>

                {project.image ? (
                  <Scroll3D
                    className="mt-6"
                    rotateX={16}
                    translateY={64}
                    translateZ={-150}
                    scale={0.06}
                    fade={0.4}
                    perspective={1100}
                  >
                    <Tilt3D strength={5} perspective={1300}>
                      <figure className="overflow-hidden rounded-lg border border-border/80 bg-muted/20">
                        <div className="flex items-center gap-1.5 border-b border-border/70 bg-muted/40 px-3 py-2">
                          <span className="h-2 w-2 rounded-full bg-destructive/50" />
                          <span className="h-2 w-2 rounded-full bg-amber-500/50" />
                          <span className="h-2 w-2 rounded-full bg-brand/50" />
                        </div>
                        <Image
                          src={project.image}
                          alt={project.imageAlt ?? project.name}
                          width={1910}
                          height={872}
                          sizes="(min-width: 768px) 42rem, 100vw"
                          className="h-auto w-full"
                        />
                      </figure>
                    </Tilt3D>
                  </Scroll3D>
                ) : null}

                <dl className="mt-6 space-y-4">
                  <div>
                    <dt className="label mb-1.5">The problem</dt>
                    <dd className="text-pretty text-sm leading-relaxed text-muted-foreground">
                      {project.problem}
                    </dd>
                  </div>
                  <div>
                    <dt className="label mb-1.5">What I built</dt>
                    <dd className="text-pretty text-sm leading-relaxed text-muted-foreground">
                      {project.build}
                    </dd>
                  </div>
                </dl>

                <ul className="mt-5 space-y-2">
                  {project.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground/90"
                    >
                      <span className="mt-[9px] h-px w-3 shrink-0 bg-brand/60" />
                      <span className="text-pretty">{highlight}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <span className="mr-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/60">
                    {project.role}
                  </span>
                  {project.stack.map((tech) => (
                    <span
                      key={tech}
                      className="rounded border border-border/80 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <ProjectLinks project={project} />
            </div>
          </Reveal>
        ))}
      </ul>

      <p className="mt-8 font-mono text-xs text-muted-foreground">
        More on{" "}
        <a
          href="https://github.com/adhamaa"
          target="_blank"
          rel="noopener noreferrer"
          className="link-underline text-foreground"
        >
          github.com/adhamaa
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </p>
    </Section>
  );
}
