# adhamaa.github.io

Personal site and portfolio of **Adham Akmal Azmi** — a statically exported Next.js build, deployed to GitHub Pages on every push to `master`.

**Live:** https://adhamaa.github.io

[![CI/CD](https://github.com/adhamaa/adhamaa.github.io/actions/workflows/main.yml/badge.svg)](https://github.com/adhamaa/adhamaa.github.io/actions/workflows/main.yml)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

> Looking for the profile README instead? That lives in [adhamaa/adhamaa](https://github.com/adhamaa/adhamaa) — GitHub renders the Overview only from the repo named after the account.

---

## What it is

A one-page portfolio plus an about page, a cover letter and a component lab, built dark-first with a terminal/editor aesthetic. Three things shape the implementation:

- **No server.** `output: "export"` produces a fully static `out/`. Nothing runs at request time, so hosting is free and there is nothing to keep patched.
- **Its own CMS.** Content is plain YAML and Markdown in `content/`, edited at `/admin` from any device and validated at build time. Copy is data, not JSX.
- **Client JS only where earned.** Pages that need no interactivity ship none; the palette, theme toggle and scroll reveals are the only client components.

## Stack

| Layer | Choice |
| :--- | :--- |
| Framework | Next.js 16, App Router, static export |
| Language | TypeScript, React 19 |
| Styling | Tailwind CSS with CSS-variable design tokens, dark-first |
| Primitives | React Aria Components via shadcn, in `src/components/ui` (see ADR 0001) |
| Fonts | Inter + JetBrains Mono via `next/font` |
| Table demo | React Aria table primitive, driven against custom markup |
| Hosting | GitHub Pages via GitHub Actions |

## Layout

```
src/
  app/              routes: / , /about , /cover-letter , /table (lab), /work/<slug> (Case Studies), sitemap.ts, robots.ts
  components/
    sections/       home page sections (hero, work, experience, stack, contact)
    site/           chrome: nav, footer, command palette, reveal, icons
    ui/             shadcn primitives on React Aria
  content/load.mts  validates content/ and returns typed Content, or errors by file and field
  data/             typed adapters the pages import; generated/ is compiled from content/
    cover-letter.ts the open cover letter rendered by /cover-letter (not in the CMS)
    pipeline.ts     the home page pipeline copy (not in the CMS)
    deployments.ts  sample rows for the component lab table
content/            ← the Content: edit this, or use /admin
  profile.yml       identity, tagline, stats, bio, capabilities, principles
  roles.yml         experience, most relevant first
  stack.yml         Stack Groups, in display order
  projects/<slug>.md  one Project per file; the Markdown body is its Case Study
scripts/            compile-content.mts, run before dev, build and typecheck
public/admin/       the Sveltia CMS page and its config.yml
e2e/                smoke suite + the static server it runs against
resume/             résumé + cover letter sources (HTML) → rendered to public/*.pdf
public/             static assets, including the résumé and cover letter PDFs
```

### Editing content

Edit at **`/admin`** (Sveltia CMS, signed in with GitHub), or change the files in `content/` directly. Every save is a commit to `master` with a `content:` message. It goes through Verify like any other push and never cuts a release. See [ADR 0003](docs/adr/0003-git-based-cms-on-static-export.md), and [CONTEXT.md](CONTEXT.md) for the vocabulary.

The build checks what the layout depends on, and fails, naming the file and field, if a rule is broken:

- a Project's Slug is its file name, set once when it is created, in lowercase letters, digits and hyphens;
- two to four highlights, at least one tool in the stack, and a Status of `shipped`, `active` or `archived`;
- screenshots must be 1344×614 WebP;
- Case Study images, in `public/case-studies/<slug>/`, must be 500 KB or smaller.

`draft: true` keeps a Project off the Site entirely; `caseStudyDraft: true` keeps only its Case Study off. Neither has anything to do with Status.

**One-time setup for sign-in.** GitHub Pages can't complete GitHub's OAuth flow, so `/admin` signs in through a small Worker on your own Cloudflare account:

1. Deploy [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) to Cloudflare Workers.
2. Register a GitHub OAuth App with `<worker-url>/callback` as its callback URL, and give the Worker its client ID and secret.
3. Put the Worker's URL in `base_url` in `public/admin/config.yml`.

No secret goes in this repository.

## Local development

CI installs with **pnpm** from `pnpm-lock.yaml`, so use it locally too:

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000.

```bash
pnpm build       # static export to out/
pnpm lint        # eslint, same rules CI enforces
pnpm typecheck   # compile content/, then tsc --noEmit
pnpm test:content  # the content loader's rules, on Node's test runner
pnpm test:e2e    # build, then drive a browser over out/
```

> **Note:** `pnpm-lock.yaml` is the only lockfile, and the pnpm version is pinned by the `packageManager` field in `package.json`. CI installs with `--frozen-lockfile`, so commit the lockfile alongside any dependency change or the deploy will fail.

## Tests

`e2e/` holds a Playwright smoke suite that drives a real browser against the built static export in `out/` — the exact artifact that deploys. It asserts only what a visitor can see: headings, rows, sorting, search. It deliberately avoids class names, DOM structure and component markup, so it stays useful across framework and styling upgrades rather than failing on them.

`pnpm test:e2e` builds and runs it. With a build already in `out/`, `pnpm exec playwright test` skips the rebuild, and `pnpm test:e2e:ui` opens the interactive runner. The static server under `e2e/` is plain Node with no dependencies, for the same reason.

The one exception is `e2e/admin.spec.ts`. The editor is a third-party app that needs a GitHub sign-in, so the suite only checks that its page and `config.yml` are served, by reading them. The editor itself is checked by hand.

`src/content/load.test.mts` covers the content loader: each test builds a small Site on disk and checks the Content or errors that come back. `pnpm test:content` runs it.

`.github/workflows/main.yml` runs both, with lint and typecheck, on every pull request.

## Deployment and releases

One workflow, `.github/workflows/main.yml`, covers all of it:

| Event | What runs |
| --- | --- |
| Pull request | **Verify**: lint, typecheck, build, smoke suite |
| Push to `master` | **Verify**, then **Deploy** and **Release** in parallel |

Verify builds the static export once. The same `out/` it tests is what Pages publishes, so nothing ships that was not tested. The workflow can also be run by hand from the Actions tab.

**Releases are automatic.** Merge a pull request with a `fix:` or `feat:` title (use `feat!:` for a breaking change) and, once Verify passes, release-please opens a release PR, the workflow merges it, and the `vX.Y.Z` tag and GitHub release appear. Other types (`chore:`, `docs:`) do not cut a release. The release commit only bumps `package.json` and `CHANGELOG.md`, and is pushed with the workflow token, which starts no further runs, so a release costs no second build or deploy. Configuration lives in `release-please-config.json` and `.release-please-manifest.json`.

To force a specific version, add a `Release-As: x.y.z` footer to a commit message.

- Pages source is **GitHub Actions**, not a branch.
- This is a *user* site (`<username>.github.io`), served at the domain root, so **no `basePath` is needed**. Setting one would break every asset path — see the commented-out line in `next.config.js`.
- `public/.nojekyll` stops Pages from filtering `_next/`.

## Résumé & cover letter

Two print documents live in `resume/` as HTML and render to PDFs in `public/`. Edits go in the HTML; the PDF is then rebuilt:

```bash
msedge --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="public/Adham_Akmal_Azmi_Resume.pdf" \
  "file:///<absolute-path>/resume/Adham_Akmal_Azmi_Resume.html"
```

```bash
msedge --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="public/Adham_Akmal_Azmi_Cover_Letter.pdf" \
  "file:///<absolute-path>/resume/Adham_Akmal_Azmi_Cover_Letter.html"
```

Any Chromium binary works in place of `msedge`. The résumé targets two A4 pages and the cover letter one, and both stay text-extractable so applicant tracking systems can parse them.

> **Note:** the cover letter exists twice — as `resume/Adham_Akmal_Azmi_Cover_Letter.html` for print, and as `src/data/cover-letter.ts` for the `/cover-letter` page. They are not generated from each other, so change the prose in both.

## License

Code is free to learn from. The written content, résumé and personal branding are not — please don't redeploy this as your own portfolio.
