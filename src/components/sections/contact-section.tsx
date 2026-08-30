import { ArrowUpRight, Check, Download } from "lucide-react";

import { Reveal } from "@/components/site/reveal";
import { CopyEmail } from "@/components/site/copy-email";
import { iconMap } from "@/components/site/icons";
import { profile, socials } from "@/data/profile";

export function ContactSection() {
  return (
    <section
      id="contact"
      className="relative scroll-mt-24 overflow-hidden border-t border-border/70 py-20 sm:py-28"
    >
      <div
        aria-hidden
        className="dotted pointer-events-none absolute inset-0 -z-10 opacity-60 mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,#000,transparent)]"
      />

      <div className="flex items-baseline gap-4">
        <span className="font-mono text-xs text-brand">05</span>
        <span className="label">Contact</span>
      </div>

      <div className="mt-6 grid gap-12 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">
        <Reveal>
          <h2 className="max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Hiring, or need something built?
          </h2>
          <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
            I&apos;m open to full-time roles and contract work, remote or in
            Malaysia. Tell me what you&apos;re trying to ship and I&apos;ll tell
            you honestly whether I&apos;m the right person for it — usually
            within a day.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="group inline-flex h-11 items-center gap-2 rounded-md bg-brand px-5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
            >
              Email me
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
            <CopyEmail className="h-11" />
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border/80 px-4 font-mono text-xs text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" />
              résumé.pdf
            </a>
          </div>

          <div className="mt-10">
            <span className="label">What I can take off your plate</span>
            <ul className="mt-4 grid max-w-2xl gap-x-8 gap-y-2.5 sm:grid-cols-2">
              {profile.capabilities.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground"
                >
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                  <span className="text-pretty">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={120} className="lg:min-w-[18rem]">
          <ul className="grid gap-px overflow-hidden rounded-lg border border-border/80 bg-border/60">
            {socials
              .filter((social) => social.icon !== "mail")
              .map((social) => {
                const Icon = iconMap[social.icon];
                return (
                  <li key={social.name} className="bg-background">
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between gap-6 px-5 py-4 transition-colors hover:bg-muted/40"
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-brand" />
                        <span className="text-sm">{social.name}</span>
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {social.handle}
                      </span>
                    </a>
                  </li>
                );
              })}
            <li className="bg-background px-5 py-4">
              <span className="label">Based in</span>
              <p className="mt-1.5 text-sm">
                {profile.location} · {profile.timezone}
              </p>
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
