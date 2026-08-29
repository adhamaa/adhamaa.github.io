import * as React from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";

import { cn } from "@/lib/utils";
import { profile, socials } from "@/data/profile";
import { marqueeItems } from "@/data/stack";
import { iconMap } from "@/components/site/icons";
import { Reveal } from "@/components/site/reveal";
import { Scroll3D, Tilt3D } from "@/components/site/scroll-3d";

/** Editor-style token colours that hold up in both themes. */
const token = {
  keyword: "text-violet-600 dark:text-violet-400",
  name: "text-sky-700 dark:text-sky-300",
  prop: "text-foreground/80",
  string: "text-emerald-700 dark:text-emerald-400",
  literal: "text-amber-700 dark:text-amber-400",
  punct: "text-muted-foreground/70",
  comment: "text-muted-foreground/60 italic",
};

function Line({ n, children }: { n: number; children?: React.ReactNode }) {
  return (
    <div className="group flex gap-4 px-4 leading-6 hover:bg-foreground/[0.03]">
      <span className="w-4 shrink-0 select-none text-right text-muted-foreground/40">
        {n}
      </span>
      <span className="min-w-0 whitespace-pre-wrap break-words">{children}</span>
    </div>
  );
}

function Str({ children }: { children: React.ReactNode }) {
  return <span className={token.string}>&quot;{children}&quot;</span>;
}

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Blueprint grid + soft glow */}
      <Scroll3D
        mode="exit"
        start={0.08}
        end={-0.92}
        translateY={90}
        translateZ={-260}
        fade={0.7}
        perspective={900}
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div aria-hidden className="grid-backdrop h-full w-full" />
      </Scroll3D>
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-18rem] -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]"
      />

      <div className="container grid items-center gap-16 pb-16 pt-16 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-20">
        <div className="max-w-2xl">
          <Reveal className="mb-8 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background/60 px-3 py-1 font-mono text-[11px] text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                {profile.available ? (
                  <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-brand" />
                ) : null}
                <span
                  className={cn(
                    "relative inline-flex h-1.5 w-1.5 rounded-full",
                    profile.available ? "bg-brand" : "bg-muted-foreground"
                  )}
                />
              </span>
              {profile.availableLabel}
            </span>
            <span className="font-mono text-[11px] text-muted-foreground/70">
              {profile.location} · {profile.timezone}
            </span>
          </Reveal>

          <Reveal delay={60}>
            <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              {profile.name}
              <span className="text-brand">.</span>
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <p className="mt-4 flex flex-wrap items-center gap-2 font-mono text-sm text-muted-foreground sm:text-base">
              <span className="text-brand">$</span>
              <span>{profile.role.toLowerCase()}</span>
              <span className="text-muted-foreground/40">—</span>
              <span>5+ years shipping</span>
              <span className="inline-block h-4 w-[7px] animate-blink bg-brand align-middle" />
            </p>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-8 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {profile.tagline}
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${profile.email}`}
                className="group inline-flex h-11 items-center gap-2 rounded-md bg-brand px-5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
              >
                Hire me
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-11 items-center gap-2 rounded-md border border-border px-5 text-sm font-medium transition-colors hover:border-brand/50 hover:bg-muted/50"
              >
                <Download className="h-4 w-4" />
                Résumé
              </a>
              <Link
                href="/#work"
                className="group inline-flex h-11 items-center gap-2 px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                See the work
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          <Reveal delay={300} depth>
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-lg border border-border/80 bg-border/60">
              {profile.stats.map((stat) => (
                <div key={stat.label} className="bg-background px-4 py-4">
                  <dt className="font-mono text-xl font-medium text-brand sm:text-2xl">
                    {stat.value}
                  </dt>
                  <dd className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
                    {stat.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={340}>
            <ul className="mt-8 flex items-center gap-5">
              {socials.map((social) => {
                const Icon = iconMap[social.icon];
                return (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      target={social.icon === "mail" ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="text-muted-foreground transition-colors hover:text-brand"
                    >
                      <span className="sr-only">{social.name}</span>
                      <Icon className="h-[18px] w-[18px]" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>

        {/* whoami.ts */}
        <Reveal delay={200} depth className="lg:w-full lg:justify-self-end">
          <Scroll3D
            mode="exit"
            start={0.22}
            end={-0.55}
            rotateX={10}
            translateY={70}
            translateZ={-200}
            fade={0.55}
            perspective={1400}
          >
            <Tilt3D strength={5} perspective={1100}>
              <div className="overflow-hidden rounded-xl border border-border/80 bg-card/70 shadow-2xl shadow-black/5 backdrop-blur-sm dark:shadow-black/40">
                <div className="flex items-center gap-2 border-b border-border/70 bg-muted/40 px-4 py-2.5">
                  <span className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-brand/60" />
                  </span>
                  <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                    ~/{profile.handle}/whoami.ts
                  </span>
                </div>

                <pre className="overflow-x-auto py-4 font-mono text-[12.5px] sm:text-[13px]">
                  <code>
                    <Line n={1}>
                      <span className={token.comment}>{"// the short version"}</span>
                    </Line>
                    <Line n={2}>
                      <span className={token.keyword}>const</span>{" "}
                      <span className={token.name}>adham</span>{" "}
                      <span className={token.punct}>= {"{"}</span>
                    </Line>
                    <Line n={3}>
                      {"  "}
                      <span className={token.prop}>role</span>
                      <span className={token.punct}>: </span>
                      <Str>{profile.role}</Str>
                      <span className={token.punct}>,</span>
                    </Line>
                    <Line n={4}>
                      {"  "}
                      <span className={token.prop}>frontend</span>
                      <span className={token.punct}>: [</span>
                      <Str>TypeScript</Str>
                      <span className={token.punct}>, </span>
                      <Str>React</Str>
                      <span className={token.punct}>, </span>
                      <Str>Next.js</Str>
                      <span className={token.punct}>],</span>
                    </Line>
                    <Line n={5}>
                      {"  "}
                      <span className={token.prop}>backend</span>
                      <span className={token.punct}>: [</span>
                      <Str>Hono</Str>
                      <span className={token.punct}>, </span>
                      <Str>Express</Str>
                      <span className={token.punct}>, </span>
                      <Str>GraphQL</Str>
                      <span className={token.punct}>, </span>
                      <Str>Flask</Str>
                      <span className={token.punct}>],</span>
                    </Line>
                    <Line n={6}>
                      {"  "}
                      <span className={token.prop}>owns</span>
                      <span className={token.punct}>: [</span>
                      <Str>schema</Str>
                      <span className={token.punct}>, </span>
                      <Str>api</Str>
                      <span className={token.punct}>, </span>
                      <Str>ui</Str>
                      <span className={token.punct}>, </span>
                      <Str>deploy</Str>
                      <span className={token.punct}>],</span>
                    </Line>
                    <Line n={7}>
                      {"  "}
                      <span className={token.prop}>runsOn</span>
                      <span className={token.punct}>: </span>
                      <Str>Cloudflare + Neon Postgres</Str>
                      <span className={token.punct}>,</span>
                    </Line>
                    <Line n={8}>
                      {"  "}
                      <span className={token.prop}>available</span>
                      <span className={token.punct}>: </span>
                      <span className={token.literal}>
                        {String(profile.available)}
                      </span>
                      <span className={token.punct}>,</span>
                    </Line>
                    <Line n={9}>
                      <span className={token.punct}>{"}"} </span>
                      <span className={token.keyword}>satisfies</span>{" "}
                      <span className={token.name}>Engineer</span>
                      <span className={token.punct}>;</span>
                    </Line>
                    <Line n={10} />
                    <Line n={11}>
                      <span className={token.comment}>
                        {"// press ⌘K to look around"}
                      </span>
                    </Line>
                  </code>
                </pre>
              </div>
            </Tilt3D>
          </Scroll3D>
        </Reveal>
      </div>

      {/* Tech ticker */}
      <div className="relative flex overflow-hidden border-y border-border/70 py-3">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent"
        />
        <div className="flex min-w-full shrink-0 animate-marquee items-center gap-10 pr-10">
          {[...marqueeItems, ...marqueeItems].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="flex shrink-0 items-center gap-10 font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground/60"
            >
              {item}
              <span className="text-brand/50">/</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
