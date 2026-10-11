import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import { caseStudies } from "@/data/case-studies";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { NewTab } from "@/components/site/new-tab";
import { caseStudyPath } from "@/lib/utils";

type Params = { slug: string };

/** Only published Case Studies get a page; any other address is a 404. */
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return caseStudies.map(({ slug }) => ({ slug }));
}

function findCaseStudy(slug: string) {
  const caseStudy = caseStudies.find((c) => c.slug === slug);
  const project = projects.find((p) => p.slug === slug);
  return caseStudy && project ? { caseStudy, project } : null;
}

function caseStudyTitle(name: string) {
  return `${name} — case study`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const found = findCaseStudy((await params).slug);
  if (!found) return {};
  const { project } = found;
  return {
    title: caseStudyTitle(project.name),
    description: project.kicker,
    alternates: { canonical: caseStudyPath(project.slug) },
    openGraph: { type: "article", title: project.name, description: project.kicker },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const found = findCaseStudy((await params).slug);
  if (!found) notFound();
  const { caseStudy, project } = found;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: caseStudyTitle(project.name),
    description: project.kicker,
    url: `${profile.siteUrl}${caseStudyPath(project.slug)}`,
    author: { "@type": "Person", name: profile.name, url: profile.siteUrl },
    about: project.name,
  };

  return (
    <div className="relative">
      <div
        aria-hidden
        className="grid-backdrop pointer-events-none absolute inset-x-0 top-0 -z-10 h-112"
      />

      <article className="container py-16 sm:py-24">
        <Link
          href="/#work"
          className="link-underline touch-target font-mono text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          All work
        </Link>

        <header className="mt-10 max-w-3xl">
          <span className="label">
            <span className="text-brand">{"//"}</span> case study
          </span>
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            {project.name}
          </h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
            {project.kicker}
          </p>

          <dl className="mt-8 grid gap-x-8 gap-y-4 font-mono text-xs sm:grid-cols-3">
            <div>
              <dt className="label">Status</dt>
              <dd className="mt-1.5">{project.status}</dd>
            </div>
            <div>
              <dt className="label">Year</dt>
              <dd className="mt-1.5">{project.year}</dd>
            </div>
            <div>
              <dt className="label">Role</dt>
              <dd className="mt-1.5">{project.role}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {project.stack.map((tech) => (
              <span
                key={tech}
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

        {/* Owner-written Markdown, rendered to HTML at build time. */}
        <div
          className="case-study mt-16 max-w-2xl border-t border-border/70 pt-12"
          dangerouslySetInnerHTML={{ __html: caseStudy.html }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
        />
      </article>
    </div>
  );
}
