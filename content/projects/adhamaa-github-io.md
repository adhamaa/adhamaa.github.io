---
name: adhamaa.github.io
order: 5
draft: false
kicker: This site
problem: A portfolio that loads slowly or says nothing concrete is worse than no portfolio at all.
build: A statically exported Next.js build with a typed content layer, dark-first design tokens and a ⌘K command palette. Ships zero client JavaScript on the pages that don't need any.
role: Design + build
year: "2026"
stack:
  - Next.js
  - TypeScript
  - Tailwind CSS
  - Radix UI
  - GitHub Pages
highlights:
  - Fully static export — no server, no runtime cost, deployed by GitHub Actions on push
  - Content is edited through its own Git-based CMS, and every save has to pass lint, typecheck, build and a browser smoke suite before it deploys
repo: https://github.com/adhamaa/adhamaa.github.io
live: https://adhamaa.github.io
status: active
---
## Why a portfolio needs a pipeline

A portfolio is a claim about how you work. If it is slow, inaccessible or quietly broken, it argues against you — so this site is held to the same standard as the systems it shows.

## One build, tested, then shipped

The site is a fully static export of Next.js served by GitHub Pages: no server, nothing to patch, nothing to pay for. A single CI pipeline builds that export once, lints and typechecks it, and runs a Playwright smoke suite against the exact files that will deploy. Only that tested build goes live, and releases cut themselves from conventional commits.

The smoke suite only asserts what a visitor can see — headings, links, the command palette opening and filtering — never class names or markup. That is what let the stack move from Tailwind 3 to 4 and from Radix to React Aria without the tests becoming noise.

## Decisions written down

The choices that would surprise a newcomer are recorded as short decision records: React Aria as the component base, for the keyboard-driven command palette and sortable table; Tailwind 4 and the browser floor it brings; and a Git-based CMS on a static site.

## Its own CMS

Content — the profile, Projects, Roles and the stack — lives in plain files in the repository and is edited at `/admin`, from any device. Every save is a commit that goes through the same pipeline, and the build checks the rules a layout depends on: highlights per Project, screenshot sizes, image weights. A broken edit fails the build instead of reaching the live site.
