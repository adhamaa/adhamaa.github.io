"use client";

import { ArrowUpRight } from "lucide-react";
import { useEditState, useTina } from "tinacms/dist/react";
import { TinaMarkdown, type TinaMarkdownContent } from "tinacms/dist/rich-text";

import { NewTab } from "@/components/site/new-tab";
import { CASE_STUDY_QUERY, editable, type CaseStudyData } from "@/lib/tina";

/**
 * A Case Study's header and write-up. Visitors get the build's HTML; inside
 * /editor, Tina swaps in live data, every field becomes click-to-edit, and the
 * write-up renders from Tina's rich-text tree as the owner types.
 */
export function CaseStudyView({
  initial,
  html,
  relativePath,
}: {
  initial: CaseStudyData;
  html: string;
  relativePath: string;
}) {
  const { data } = useTina({
    query: CASE_STUDY_QUERY,
    variables: { relativePath },
    data: initial,
  });
  const project = data.project;
  const { edit } = useEditState();
  const live = typeof project.body === "object" && project.body !== null;

  return (
    <>
      <header className="mt-10 max-w-3xl">
        <span className="label">
          <span className="text-brand">{"//"}</span> case study
        </span>
        <h1
          className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl"
          data-tina-field={editable(edit, project, "name")}
        >
          {project.name}
        </h1>
        <p
          className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground"
          data-tina-field={editable(edit, project, "kicker")}
        >
          {project.kicker}
        </p>

        <dl className="mt-8 grid gap-x-8 gap-y-4 font-mono text-xs sm:grid-cols-3">
          <div>
            <dt className="label">Status</dt>
            <dd className="mt-1.5" data-tina-field={editable(edit, project, "status")}>
              {project.status}
            </dd>
          </div>
          <div>
            <dt className="label">Year</dt>
            <dd className="mt-1.5" data-tina-field={editable(edit, project, "year")}>
              {project.year}
            </dd>
          </div>
          <div>
            <dt className="label">Role</dt>
            <dd className="mt-1.5" data-tina-field={editable(edit, project, "role")}>
              {project.role}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {(project.stack ?? []).map((tech, i) => (
            <span
              key={`${i}-${tech}`}
              data-tina-field={editable(edit, project, "stack", i)}
              className="rounded border border-border/80 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              {tech}
            </span>
          ))}
          {project.live && !project.live.startsWith("/") ? (
            <a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline touch-target ml-2 font-mono text-xs"
            >
              visit
              <ArrowUpRight className="h-3.5 w-3.5" />
              <NewTab />
            </a>
          ) : null}
        </div>
      </header>

      {live ? (
        <div
          className="case-study mt-16 max-w-2xl border-t border-border/70 pt-12"
          data-tina-field={editable(edit, project, "body")}
        >
          <TinaMarkdown content={project.body as TinaMarkdownContent} />
        </div>
      ) : (
        // Owner-written Markdown, rendered to HTML at build time.
        <div
          className="case-study mt-16 max-w-2xl border-t border-border/70 pt-12"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </>
  );
}
