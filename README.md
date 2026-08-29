# adhamaa.github.io

Personal site and portfolio of **Adham Akmal Azmi** — a statically exported Next.js build, deployed to GitHub Pages on every push to `master`.

**Live:** https://adhamaa.github.io

[![Deploy](https://github.com/adhamaa/adhamaa.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/adhamaa/adhamaa.github.io/actions/workflows/deploy.yml)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

> Looking for the profile README instead? That lives in [adhamaa/adhamaa](https://github.com/adhamaa/adhamaa) — GitHub renders the Overview only from the repo named after the account.

---

## What it is

A one-page portfolio plus an about page and a component lab, built dark-first with a terminal/editor aesthetic. Three things shape the implementation:

- **No server.** `output: "export"` produces a fully static `out/`. Nothing runs at request time, so hosting is free and there is nothing to keep patched.
- **Typed content layer.** Copy is data, not JSX. Everything personal lives in `src/data/` and the pages render whatever is there.
- **Client JS only where earned.** Pages that need no interactivity ship none; the palette, theme toggle and scroll reveals are the only client components.

## Stack

| Layer | Choice |
| :--- | :--- |
| Framework | Next.js 14, App Router, static export |
| Language | TypeScript |
| Styling | Tailwind CSS with CSS-variable design tokens, dark-first |
| Primitives | Radix UI / shadcn-style components in `src/components/ui` |
| Fonts | Inter + JetBrains Mono via `next/font` |
| Table demo | Mantine React Table, driven headlessly against custom markup |
| Hosting | GitHub Pages via GitHub Actions |

## Layout

```
src/
  app/              routes: / , /about , /table (lab), sitemap.ts, robots.ts
  components/
    sections/       home page sections (hero, work, experience, stack, contact)
    site/           chrome: nav, footer, command palette, reveal, icons
    ui/             shadcn primitives
  data/             ← the content layer, edit this first
    profile.ts      identity, tagline, stats, capabilities, principles
    projects.ts     selected work: problem / what I built / highlights
    experience.ts   roles, education, languages
    stack.ts        grouped tech + hero ticker
resume/             résumé source (HTML) → rendered to public/*.pdf
public/             static assets, including the résumé PDF
```

### Editing content

Change `src/data/*.ts` — not the components. The pages read from those files, so copy changes never require touching JSX. `profile.ts` is the single source of truth for name, role, contact details and the résumé link, and it feeds page metadata, the sitemap and the JSON-LD `Person` schema as well as the visible page.

## Local development

CI installs with **pnpm** from `pnpm-lock.yaml`, so use it locally too:

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000.

```bash
pnpm build   # static export to out/
pnpm lint    # eslint, same rules CI enforces
```

> **Note:** `pnpm-lock.yaml` is the only lockfile, and the pnpm version is pinned by the `packageManager` field in `package.json`. CI installs with `--frozen-lockfile`, so commit the lockfile alongside any dependency change or the deploy will fail.

## Deployment

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on push to `master`, and can be run manually from the Actions tab.

- Pages source is **GitHub Actions**, not a branch.
- This is a *user* site (`<username>.github.io`), served at the domain root, so **no `basePath` is needed**. Setting one would break every asset path — see the commented-out line in `next.config.js`.
- `public/.nojekyll` stops Pages from filtering `_next/`.

## Résumé

The PDF at `public/Adham_Akmal_Azmi_Resume.pdf` is generated from `resume/Adham_Akmal_Azmi_Resume.html`, so edits go in the HTML and the PDF is rebuilt:

```bash
msedge --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="public/Adham_Akmal_Azmi_Resume.pdf" \
  "file:///<absolute-path>/resume/Adham_Akmal_Azmi_Resume.html"
```

Any Chromium binary works in place of `msedge`. The layout targets two A4 pages and the output stays text-extractable so applicant tracking systems can parse it.

## License

Code is free to learn from. The written content, résumé and personal branding are not — please don't redeploy this as your own portfolio.
