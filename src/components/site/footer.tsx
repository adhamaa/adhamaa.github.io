import Link from "next/link";
import { profile, socials } from "@/data/profile";
import { iconMap } from "@/components/site/icons";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70">
      <div className="container flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <p className="font-mono text-sm">
            <span className="text-brand">~/</span>
            {profile.handle}
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            {profile.role} · {profile.focus}
          </p>
          <p className="font-mono text-[11px] text-muted-foreground/70">
            Built with Next.js, TypeScript and Tailwind. Statically exported,
            deployed on GitHub Pages.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <span className="label">Elsewhere</span>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-1">
            {socials.map((social) => {
              const Icon = iconMap[social.icon];
              return (
                <li key={social.name}>
                  <a
                    href={social.href}
                    target={social.icon === "mail" ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Icon className="h-3.5 w-3.5 transition-colors group-hover:text-brand" />
                    {social.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="container flex flex-col gap-2 py-4 font-mono text-[11px] text-muted-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {year} {profile.name}. All rights reserved.
          </span>
          <span className="flex items-center gap-4">
            <Link href="/table" className="hover:text-foreground">
              /lab
            </Link>
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              résumé
            </a>
            <a
              href={profile.coverLetterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              cover letter
            </a>
            <a
              href="https://github.com/adhamaa/adhamaa"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              source
            </a>
            <span className="hidden sm:inline">{profile.timezone}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
