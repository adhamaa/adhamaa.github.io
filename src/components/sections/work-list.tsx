"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEditState, useTina } from "tinacms/dist/react";

import { caseStudyPath, cn, listNumber } from "@/lib/utils";
import {
  WORK_LIST_QUERY,
  editable,
  visibleProjects,
  type TinaProject,
  type WorkListData,
} from "@/lib/tina";
import { Reveal } from "@/components/site/reveal";
import { NewTab } from "@/components/site/new-tab";
import { Scroll3D, Tilt3D } from "@/components/site/scroll-3d";
import { GitHubIcon } from "@/components/site/icons";

const statusStyles: Record<NonNullable<TinaProject["status"]>, string> = {
  active: "border-brand/40 text-brand",
  shipped: "border-border text-muted-foreground",
  archived: "border-border/60 text-muted-foreground",
};

function ProjectLinks({ project }: { project: TinaProject }) {
  const linkClass =
    "touch-target inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground";

  return (
    <div className="flex flex-row items-start gap-4 md:flex-col md:items-end md:gap-3">
      <span
        className={cn(
          "rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]",
          statusStyles[project.status ?? "active"]
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
            <NewTab />
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
          <NewTab />
        </a>
      ) : null}
    </div>
  );
}

/**
 * The work list. Visitors see the build's Projects; inside /editor, Tina swaps
 * in live data and every visible field becomes click-to-edit.
 */
export function WorkList({ initial }: { initial: WorkListData }) {
  const { data } = useTina({ query: WORK_LIST_QUERY, variables: {}, data: initial });
  const projects = visibleProjects(data);
  const { edit } = useEditState();

  return (
        <ul className="border-t border-border/70">
          {projects.map((project, index) => (
            <Reveal
              as="li"
              key={project.slug}
              delay={index * 80}
              depth
              className="group border-b border-border/70"
            >
              <div className="grid gap-6 py-10 transition-colors md:grid-cols-[5rem_1fr_9rem] md:gap-10 md:group-hover:bg-muted/20">
                <div className="flex items-center gap-3 font-mono text-xs md:flex-col md:items-start md:gap-1">
                  <span className="text-brand">{listNumber(index)}</span>
                  <span className="text-muted-foreground" data-tina-field={editable(edit, project, "year")}>
                    {project.year}
                  </span>
                </div>

                <div className="min-w-0 max-w-2xl">
                  <h3
                    className="text-xl font-medium tracking-tight transition-colors group-hover:text-brand sm:text-2xl"
                    data-tina-field={editable(edit, project, "name")}
                  >
                    {project.name}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground" data-tina-field={editable(edit, project, "kicker")}>
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
                        <figure
                          className="overflow-hidden rounded-lg border border-border/80 bg-muted/20"
                          data-tina-field={editable(edit, project, "image")}
                        >
                          <div className="flex items-center gap-1.5 border-b border-border/70 bg-muted/40 px-3 py-2">
                            <span className="h-2 w-2 rounded-full bg-destructive/50" />
                            <span className="h-2 w-2 rounded-full bg-amber-500/50" />
                            <span className="h-2 w-2 rounded-full bg-brand/50" />
                          </div>
                          <Image
                            src={project.image}
                            alt={project.imageAlt ?? project.name ?? ""}
                            width={1344}
                            height={614}
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
                      <dd
                        className="text-pretty text-sm leading-relaxed text-muted-foreground"
                        data-tina-field={editable(edit, project, "problem")}
                      >
                        {project.problem}
                      </dd>
                    </div>
                    <div>
                      <dt className="label mb-1.5">What I built</dt>
                      <dd
                        className="text-pretty text-sm leading-relaxed text-muted-foreground"
                        data-tina-field={editable(edit, project, "build")}
                      >
                        {project.build}
                      </dd>
                    </div>
                  </dl>

                  <ul className="mt-5 space-y-2">
                    {(project.highlights ?? []).map((highlight, i) => (
                      <li
                        key={`${i}-${highlight}`}
                        data-tina-field={editable(edit, project, "highlights", i)}
                        className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                      >
                        <span className="mt-[9px] h-px w-3 shrink-0 bg-brand/60" />
                        <span className="text-pretty">{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  {project.hasCaseStudy ? (
                    <Link
                      href={caseStudyPath(project.slug)}
                      className="link-underline touch-target mt-5 font-mono text-xs"
                    >
                      Read the case study
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : null}

                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <span
                      className="mr-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                      data-tina-field={editable(edit, project, "role")}
                    >
                      {project.role}
                    </span>
                    {(project.stack ?? []).map((tech, i) => (
                      <span
                        key={`${i}-${tech}`}
                        data-tina-field={editable(edit, project, "stack", i)}
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
  );
}
