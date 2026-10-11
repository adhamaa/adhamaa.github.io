import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { caseStudies } from "@/data/case-studies";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { caseStudyPath } from "@/lib/utils";
import { CaseStudyView } from "./case-study-view";

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
  const { slug: _slug, hasCaseStudy: _has, ...fields } = project;

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

        <CaseStudyView
          initial={{ project: { ...fields, body: caseStudy.body, _sys: { filename: project.slug } } }}
          relativePath={`${project.slug}.mdx`}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }}
        />
      </article>
    </div>
  );
}
