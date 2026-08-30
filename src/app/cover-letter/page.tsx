import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";

import { coverLetter } from "@/data/cover-letter";
import { profile } from "@/data/profile";
import { Reveal } from "@/components/site/reveal";

/** The sender block, printed the way it sits at the top of the PDF. */
const sender = [
  profile.name,
  profile.role,
  `${profile.location} · ${profile.timezone}`,
  profile.email,
  profile.phone,
];

export default function CoverLetter() {
  return (
    <div className="relative">
      <div
        aria-hidden
        className="grid-backdrop pointer-events-none absolute inset-x-0 top-0 -z-10 h-112"
      />

      <div className="container py-16 sm:py-24">
        <Reveal className="max-w-3xl">
          <span className="label">
            <span className="text-brand">{"//"}</span> cover letter
          </span>
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Why you should read the rest
            <span className="text-brand">.</span>
          </h1>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
            {coverLetter.note}
          </p>
        </Reveal>

        <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_18rem] lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <article className="overflow-hidden rounded-lg border border-border/80">
              <header className="border-b border-border/70 bg-muted/30 px-6 py-5 sm:px-8">
                <ul className="space-y-0.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
                  {sender.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
                  {coverLetter.dated}
                </p>
              </header>

              <div className="px-6 py-8 sm:px-8 sm:py-10">
                <p className="text-base">{coverLetter.greeting}</p>

                <p className="mt-6 text-pretty text-base leading-[1.85] text-muted-foreground">
                  {coverLetter.openingFor}
                </p>

                {coverLetter.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    className="mt-5 text-pretty text-base leading-[1.85] text-muted-foreground"
                  >
                    {paragraph}
                  </p>
                ))}

                <p className="mt-8 text-base text-muted-foreground">
                  {coverLetter.signOff}
                </p>
                <p className="mt-2 text-base font-medium">{profile.name}</p>
              </div>
            </article>

            <div className="mt-8 flex flex-wrap items-center gap-3 rounded-lg border border-border/80 p-6">
              <p className="mr-auto text-sm text-muted-foreground">
                Want this as a file, or the one-page career summary?
              </p>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm transition-colors hover:border-brand/50 hover:bg-muted/50"
              >
                <Download className="h-4 w-4" />
                Résumé
              </a>
              <a
                href={profile.coverLetterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
              >
                <Download className="h-4 w-4" />
                Cover letter
              </a>
            </div>
          </Reveal>

          {/* Meta rail */}
          <Reveal delay={80} className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <dl className="overflow-hidden rounded-lg border border-border/80">
                {[
                  { key: "from", value: profile.name },
                  { key: "role", value: profile.role },
                  { key: "status", value: profile.availableLabel },
                  { key: "based", value: profile.location },
                  { key: "dated", value: coverLetter.dated },
                ].map((fact) => (
                  <div
                    key={fact.key}
                    className="flex items-baseline justify-between gap-4 border-b border-border/70 px-4 py-3 last:border-b-0"
                  >
                    <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground/70">
                      {fact.key}
                    </dt>
                    <dd className="text-right text-sm">{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <a
                href={`mailto:${profile.email}`}
                className="mt-4 flex h-10 items-center justify-center gap-2 rounded-md bg-brand text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
              >
                Start the conversation
                <ArrowUpRight className="h-4 w-4" />
              </a>

              <Link
                href="/#work"
                className="mt-3 flex h-10 items-center justify-center gap-2 rounded-md border border-border/80 text-sm transition-colors hover:border-brand/50 hover:bg-muted/50"
              >
                See the work
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
