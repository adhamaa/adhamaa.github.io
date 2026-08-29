# Stack upgrade research — 2026-08-30

> **Why this file lives here.** This repo has no existing research-notes convention: no `docs/`,
> no `.scratch/`, no `notes/`. I created `docs/research/` as the least-surprising place for a dated,
> one-off research artefact that should be reviewable in a PR. **If a repo-setup skill is running
> concurrently and establishes a different doc layout, this file should be moved to match it** —
> nothing links to it yet, so moving it is free.
>
> **Method.** Every claim below is tagged with the URL it came from. Claims I could not confirm from
> a primary source are marked **Unverified** or collected under [Unresolved questions](#5-unresolved-questions).
> Primary sources used: `nextjs.org/docs`, `tailwindcss.com/docs`, `ui.shadcn.com/docs`,
> `raw.githubusercontent.com/shadcn-ui/ui`, `registry.npmjs.org`, `api.github.com`.
> No blog posts, Medium articles, or Stack Overflow answers are cited.
>
> **Repo facts were re-verified locally** before use. Two of the facts in the brief were slightly off —
> see [Repo facts, corrected](#repo-facts-corrected).

---

## 1. TL;DR

1. **Only 4 of the 46 files in `src/components/ui/` are actually reachable from the app** (`sonner`, `table`, `command`, `dialog`). The other 42 are dead code. Deleting them first shrinks every subsequent ticket by ~90% and removes 5 of the 7 React-19 peer-dependency blockers outright.
2. **The two components with no React Aria equivalent — `menubar` and `navigation-menu` — are both dead code in this repo.** The headline risk of the aria migration evaporates once step 1 is done. ([registry index](https://ui.shadcn.com/r/index.json), plus `HTTP 404` on `https://ui.shadcn.com/docs/components/aria/menubar` and `.../aria/navigation-menu`)
3. **The single biggest Next 16 breaking change does not apply here.** This repo uses zero async request APIs — no `cookies()`, `headers()`, `draftMode()`, `params`, or `searchParams` anywhere, no dynamic routes, no middleware. Static export is still fully supported in Next 16.3.3. ([version-16 guide](https://nextjs.org/docs/app/guides/upgrading/version-16), [static-exports](https://nextjs.org/docs/app/guides/static-exports), verified locally by grep)
4. **`init --preset` is documented to rewrite the project's CSS variables**, which is exactly where the hand-tuned palette lives, and `init` has **no `--dry-run`**. This is the one genuinely destructive step in the plan. ([skills/shadcn/cli.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/cli.md))
5. **Tailwind v4's browser floor is Firefox 128+ (July 2024)** — stricter than Next 16's own floor of Firefox 111+. For a public portfolio this is the real, user-visible cost of the Tailwind step, and Next 16 explicitly still supports Tailwind v3 if you want to skip it. ([tailwind compatibility](https://tailwindcss.com/docs/compatibility), [next 16 guide](https://nextjs.org/docs/app/guides/upgrading/version-16), [next tailwind-v3 guide](https://nextjs.org/docs/app/guides/tailwind-v3-css))

---

## 2. Risk list

Ordered by severity — "severity" here means *probability of silently destroying work or producing an un-bisectable state*, not size.

### R1 — `init --preset b0` overwrites `src/app/globals.css` design tokens (HIGH, irreversible without git)

The official shadcn agent skill describes the "skip existing components" flow as:

> **Skip** → `npx shadcn@latest init --preset <code> --force --no-reinstall`. Only updates config and CSS variables, leaves existing components as-is.
> — [skills/shadcn/cli.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/cli.md)

"Only updates config **and CSS variables**" is the whole problem: the CSS variables *are* the hand-tuned palette (`--background: 40 20% 99%`, `--brand: 158 72% 30%`, plus the four non-shadcn tokens `--brand`, `--brand-foreground`, `--grid`, `--glow`).

`init` has no `--dry-run` flag — `--dry-run` exists only on `add`. ([ui.shadcn.com/docs/cli](https://ui.shadcn.com/docs/cli), [cli.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/cli.md))

**Mitigation:** commit everything, run `init` on a clean tree, `git diff src/app/globals.css`, and hand-restore. Do not run this step with other uncommitted work in the tree.

**Caveat — sources conflict.** Reading `packages/shadcn/src/commands/init.ts` on GitHub, the init command appears to write only `components.json`, with CSS variable declarations happening later during `addComponents`. ([init.ts](https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/commands/init.ts)) I could not reconcile this with the skill doc's explicit "updates config and CSS variables". **Assume the destructive reading is correct** and protect accordingly.

### R2 — `--base aria` may be silently ignored on an existing project (HIGH, wastes a ticket)

> The CLI automatically preserves the current base (`base` vs `radix`) from `components.json`.
> — [skills/shadcn/cli.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/cli.md)

That sentence is written about `apply`, but it is in the shared "Switching Presets" section and `init --preset --force` is presented as a sibling command. The repo's `components.json` has **no `base` field at all** (it predates the concept), so what the CLI infers is genuinely unknown. If it infers `radix` and preserves it, `--base aria` is a no-op and the whole ticket produces nothing.

**Mitigation:** run `pnpm dlx shadcn@latest info` before and after; check the `base` field. See [Unresolved Q1](#5-unresolved-questions).

### R3 — Zero tests + static-export-only means nothing catches a visual regression (HIGH, structural)

There are no tests anywhere in this repo. The build is `next build` → static export → GitHub Pages. A Tailwind v4 or shadcn re-init that changes token semantics will produce a **green build and a wrong-looking site**. Nothing in CI will fail.

The `.github/workflows/deploy.yml` deploys on every push to `master` with no preview step, and it **detects npm, not pnpm** — it checks for `yarn.lock`, else falls back to `npm ci`. There is a stale `yarn.lock` *and* a `pnpm-lock.yaml` in the repo root, so CI is currently installing with **yarn** off a lockfile that no local workflow maintains. Any dependency change made with pnpm will not be reflected in CI's resolution. This is a pre-existing bug that will bite hard during a multi-step upgrade.

**Mitigation:** fix the workflow to use pnpm and delete `yarn.lock` **before** starting the upgrades. Land each upgrade on a branch and eyeball the deployed preview.

### R4 — `react-day-picker@8.10.0` hard-blocks a React 19 install (MEDIUM, blocks the step)

`react-day-picker@8.10.0` declares `peerDependencies.react: "^16.8.0 || ^17.0.0 || ^18.0.0"` — React 19 is not in the range, so pnpm will error. ([registry.npmjs.org/react-day-picker](https://registry.npmjs.org/react-day-picker))

Same problem, same cause, at the repo's pinned versions:

| Package | Pinned | `peerDependencies.react` at that version | React 19 OK? |
|---|---|---|---|
| `cmdk` | 0.2.0 | `^18.0.0` | **No** |
| `vaul` | 0.8.0 | `^16.8 \|\| ^17.0 \|\| ^18.0` | **No** |
| `embla-carousel-react` | 8.0.0-rc17 (exact) | `^16.8.0 \|\| ^17.0.1 \|\| ^18.0.0` | **No** |
| `sonner` | 1.3.1 | `^18.0.0` | **No** |
| `react-resizable-panels` | 1.0.6 | `^16.14.0 \|\| ^17.0.0 \|\| ^18.0.0` | **No** |
| `react-day-picker` | 8.10.0 | `^16.8.0 \|\| ^17.0.0 \|\| ^18.0.0` | **No** |
| `lucide-react` | 0.268.0 | `^16.5.1 \|\| ^17.0.0 \|\| ^18.0.0` | **No** |

All seven verified from `registry.npmjs.org`. **Four of the seven** — `vaul`, `embla-carousel-react`, `react-resizable-panels`, `react-day-picker` — are imported **only** from dead `src/components/ui/` files (`drawer.tsx`, `carousel.tsx`, `resizable.tsx`, `calendar.tsx`) and can simply be deleted rather than upgraded. Only `cmdk`, `sonner`, and `lucide-react` are live and must actually be bumped.

### R5 — Custom Tailwind `addVariant` plugin uses a v3-only API (MEDIUM, silent CSS loss)

`tailwind.config.ts` registers a `firefox:` variant via a plugin whose callback destructures `{ container, separator }` and receives `postcss` from the plugin API. Tailwind v4 can load legacy JS plugins via `@plugin` and legacy configs via `@config` ([functions-and-directives](https://tailwindcss.com/docs/functions-and-directives)), but **the v4 docs do not state that `addVariant` callbacks receiving `container`/`separator`/`postcss` are still supported**. If this silently no-ops, the Firefox-specific styles vanish with no error. Grep for `firefox:` usage before and after.

### R6 — Tailwind v4 utility renames touch live code (MEDIUM, mechanical but easy to miss)

Outside `src/components/ui/`, live source uses `outline-none` ×1, `ring` ×6, `ring-4` ×2, `shadow` ×6. In v4: `outline-none` → `outline-hidden`, `ring` → `ring-3` (default changed 3px → 1px), `shadow` → `shadow-sm`, `shadow-sm` → `shadow-xs`. ([upgrade-guide](https://tailwindcss.com/docs/upgrade-guide)) The codemod handles these, but the `ring` change also alters focus-ring thickness against the hand-tuned `--ring` token.

### R7 — Tailwind v4 raises the browser floor to Firefox 128 (MEDIUM, user-visible, not reversible per-user)

Tailwind v4.0 requires Chrome 111, Safari 16.4, **Firefox 128**. ([compatibility](https://tailwindcss.com/docs/compatibility)) Next 16's own floor is Chrome 111 / Edge 111 / **Firefox 111** / Safari 16.4. ([version-16 guide](https://nextjs.org/docs/app/guides/upgrading/version-16)) Adopting Tailwind v4 therefore raises the site's Firefox floor by 17 releases. This is a product decision, not a technical one, and Next 16 explicitly keeps a supported Tailwind v3 path for "broader browser support". ([nextjs.org/docs/app/guides/tailwind-v3-css](https://nextjs.org/docs/app/guides/tailwind-v3-css), linked from [getting-started/css](https://nextjs.org/docs/app/getting-started/css))

### R8 — `next-themes/dist/types` import breaks on 0.4.x (LOW, compile error, easy fix)

`src/components/theme-provider.tsx` imports `{ type ThemeProviderProps } from "next-themes/dist/types"`. next-themes v0.4.2 added "Re-export types from `next-themes`" ([releases](https://api.github.com/repos/pacocoursey/next-themes/releases)); the deep path is not guaranteed to survive. Change to `from "next-themes"`. Note that `next-themes@0.2.1` declares `peerDependencies.react: "*"` so it will *install* against React 19 without complaint — it just may not work correctly.

### R9 — `tailwind-merge@1.14.0` will produce wrong class merges under Tailwind v4 (LOW-MEDIUM, silent)

tailwind-merge v3.0.0 release notes:

> This release drops support for Tailwind CSS v3 and in turn adds support for Tailwind CSS v4. That means you should upgrade to Tailwind CSS v4 and tailwind-merge v3 together.
> — [github.com/dcastil/tailwind-merge releases](https://api.github.com/repos/dcastil/tailwind-merge/releases)

`tailwind-merge` has no `peerDependencies`, so nothing will stop you shipping v1 against Tailwind v4. `cn()` will silently mis-merge conflicting classes. Bump to `tailwind-merge@3.x` **in the same commit** as the Tailwind v4 step.

### R10 — Turbopack becomes the default build engine in Next 16 (LOW here, but a bisect hazard)

> Starting with **Next.js 16**, Turbopack is stable and used by default with `next dev` and `next build`
> — [version-16 guide](https://nextjs.org/docs/app/guides/upgrading/version-16)

This repo has no custom `webpack` config, so no build failure is expected. But if output ever differs, `--webpack` is the escape hatch, and knowing that a whole different bundler is in play matters when bisecting a "the site looks wrong" report.

### R11 — Mantine deletion is *not* a blocker, contrary to the brief's framing (informational)

`@mantine/core@6.0.22` declares `peerDependencies.react: ">=16.8.0"` and `mantine-react-table@1.3.4` declares `react: ">=18.0"`. ([registry.npmjs.org/@mantine/core](https://registry.npmjs.org/@mantine/core), [.../mantine-react-table](https://registry.npmjs.org/mantine-react-table)) **Both ranges are satisfied by React 19**, so Mantine will install cleanly and does not need to be deleted first. Whether it *runs* correctly under React 19 is **Unverified** — Mantine 6 is Emotion-based and I found no primary statement about React 19 runtime compatibility for the 6.x line. `src/app/table/page.tsx` is the only consumer.

---

## 3. Recommended upgrade order

**I recommend a different order from the one in the brief.** Proposed:

> **0. Fix CI + delete dead code → 1. Next 16 → 2. shadcn aria re-init → 3. Tailwind v4 → 4. mantine-react-table removal**

with **step 3 (Tailwind v4) explicitly optional**.

### Step 0 — Housekeeping (do this first, it is free and it shrinks everything downstream)

- **Fix `.github/workflows/deploy.yml` to use pnpm; delete the stale `yarn.lock`.** Right now CI installs with yarn off a lockfile nothing maintains (R3). Every step below is un-verifiable in CI until this is fixed. This is the highest-value ticket in the whole list and it is not an upgrade.
- **Delete the 42 unreachable files in `src/components/ui/`** (see the gap table for exactly which). This removes `vaul`, `embla-carousel-react`, `react-resizable-panels`, `react-day-picker`, `react-hook-form`, `@hookform/resolvers`, `zod`, `date-fns`, and 25 of 27 `@radix-ui/*` packages from the live dependency surface — i.e. **most of the React 19 peer conflicts stop existing rather than needing to be resolved** (R4), and the aria gap analysis collapses from 46 rows to 4.
- Rationale for going first: it is pure deletion, trivially reversible, and it is the only step that makes every later step *smaller*.

### Step 1 — Next.js 14.0.4 → 16

- Go **direct**, not via 15. The v16 guide's own codemod is `@next/codemod@canary upgrade latest`, which is the same command the v15 guide gives; both guides are served at `version: 16.3.3`. Stepping through 15 would mean adopting the async-request-API *compat shims* and then removing them — pointless when the repo uses none of those APIs at all (verified by grep: zero hits for `cookies()`, `headers()`, `draftMode()`, `params`, `searchParams` in `src/`). ([version-15](https://nextjs.org/docs/app/guides/upgrading/version-15), [version-16](https://nextjs.org/docs/app/guides/upgrading/version-16))
- This step carries the React 18 → 19 jump, which is the only genuinely cross-cutting change. Doing it before shadcn means the aria components are installed against their final React version.
- After step 0, the only live packages needing a React-19-compatible bump are `cmdk`, `sonner`, `lucide-react`, and `@radix-ui/react-dialog`.

### Step 2 — shadcn `init --base aria`

- **After** Next 16, because React 19 is the target and `react-aria-components` should be resolved against it.
- **Before** Tailwind v4, because this is the step that rewrites `globals.css` tokens (R1). Doing the destructive token rewrite while `globals.css` is still in familiar v3 shape (`@tailwind base;` + bare HSL triplets) makes the diff readable. If you re-init *after* the Tailwind migration you are diffing a machine-rewritten `@theme inline` block against a machine-rewritten preset block, and you will not be able to tell what you lost.
- With only 4 live components, the actual work is: re-add `command`, `dialog`, `table`, `sonner` under aria and fix the two call sites.

### Step 3 — Tailwind 3.3.3 → v4 (**optional; decide on R7 first**)

- Last of the three, because it is the only one that is optional and the only one with a user-visible browser-support cost.
- Next 16 fully supports Tailwind v3 via a dedicated guide, so "stay on v3" is a supported end state, not technical debt. ([nextjs.org/docs/app/guides/tailwind-v3-css](https://nextjs.org/docs/app/guides/tailwind-v3-css))
- If you do it: `tailwind-merge@1 → @3` in the same commit (R9), and `tailwindcss-animate → tw-animate-css`.

### Step 4 — `mantine-react-table` removal

- Genuinely independent — it does not block anything (R11). Do it whenever. Doing it last means `src/app/table/page.tsx` keeps working throughout, giving you one more page to eyeball for regressions at each step.
- Doing it *first* is also defensible if you want to delete `@mantine/*`, `@emotion/react`, `@tabler/icons-react`, and `dayjs` early to shrink the install.

### Why not Next → Tailwind → shadcn → table?

The brief's order puts Tailwind v4 before the shadcn re-init. That makes the `globals.css` diff in the shadcn step nearly unreadable, because both steps rewrite the same file with different token conventions (v3 bare HSL triplets → v4 `@theme inline` → preset overwrite). With no tests (R3), a readable diff is the only regression detector you have. Reversing them keeps exactly one machine rewrite per file per step.

### What makes this hard to bisect

- **No tests.** Every regression is found by looking at the deployed site.
- **`init` has no `--dry-run`.** Unlike `add`, you cannot preview it. Only a clean git tree protects you.
- **Turbopack replaces webpack** in step 1 (R10), so a "step 1 broke rendering" bug has two candidate causes.
- **The Tailwind codemod rewrites both config and every template file at once.** Its commit will be large and mixed. Run `npx @tailwindcss/upgrade` on a clean tree and commit its output *alone*, before any hand-fixes.
- **CI installs with a different package manager than you do** (R3) until step 0 lands, so "works locally, broken in prod" is currently the default failure mode.

---

## 4. Findings in full

### Repo facts, corrected

Verified locally on the worktree at `.claude/worktrees/3d-animated-scrolling-d41eaa`:

| Brief said | Actually |
|---|---|
| 44 files in `src/components/ui/` | **46** (`ls \| wc -l`). 44 `.tsx` components + `use-toast.ts` + `mode-toggle.tsx` |
| 26 `@radix-ui/*` deps | **27** (`grep -c '"@radix-ui/' package.json`) |
| `globals.css` holds a "dark-first" token set | Structurally **light-first**: `:root` is the light palette (`--background: 40 20% 99%`), `.dark` overrides. It *renders* dark-first because `src/app/layout.tsx:84` sets `defaultTheme="dark"` on next-themes. The distinction matters: a shadcn re-init will rewrite `:root` (light) and `.dark` as a pair |

Everything else in the brief checked out: `next@14.0.4`, `react`/`react-dom@18.2.0`, `typescript@5.1.6`, `tailwindcss@3.3.3`, `tailwindcss-animate@^1.0.6`, `postcss@8.4.27`, `autoprefixer@10.4.15`, `components.json` with `style: "default"` / `rsc: true` / `baseColor: "zinc"` / `cssVariables: true`, `next.config.js` with `output: "export"` + `images.unoptimized: true`, `mantine-react-table` used in exactly `src/app/table/page.tsx`, no tests.

**Local toolchain:** Node v22.23.2, pnpm 11.18.0 — both above every minimum below.

**Additional fact the brief did not mention, and it is the most important one:** only four `src/components/ui/` files are reachable from application code.

```
src/app/layout.tsx            -> @/components/ui/sonner
src/app/table/page.tsx        -> @/components/ui/table
src/components/site/command-menu.tsx -> @/components/ui/command
  └─ src/components/ui/command.tsx   -> @/components/ui/dialog
```

Every other file in `src/components/ui/` is imported only by other files in `src/components/ui/`, forming closed dead subgraphs (`toaster→toast→use-toast`, `mode-toggle→button+dropdown-menu`, `form→label`, `toggle-group→toggle`, `alert-dialog|calendar|carousel|pagination→button`).

---

### Q1 — shadcn with `--base aria`

#### a. What `--base` is, its values, and what `aria` maps to

`--base` (`-b`) selects the **headless primitive library** the generated components are built on. The CLI help lists exactly three values:

> `-b, --base <base>` — the component library (base, radix, aria)
> — [ui.shadcn.com/docs/cli](https://ui.shadcn.com/docs/cli)

- `base` → Base UI (`@base-ui/react`) — **now the default**
- `radix` → Radix UI — "remains fully supported"
- `aria` → React Aria Components

> React Aria is now a first-class component base in shadcn/ui. Build with React Aria Components alongside Base UI and Radix. Pick it in shadcn/create or initialize a project with `--base aria`. The CLI handles the dependencies, registry resolution, styles, and component installation. […] Base UI remains the default, and Radix remains fully supported. Existing projects stay on their current base.
> — [ui.shadcn.com/docs/changelog/2026-07-react-aria](https://ui.shadcn.com/docs/changelog/2026-07-react-aria)

**Upstream package confirmed:** `react-aria-components`, published by **Adobe** as part of React Spectrum. The aria component docs pages reference `react-aria-components` in their composition sections, and every aria API link in the registry index points at `https://react-aria.adobe.com/<Component>#api`. Current npm: `react-aria-components@1.20.0`, `peerDependencies.react: "^16.8.0 || ^17.0.0-rc.1 || ^18.0.0 || ^19.0.0-rc.1"` — **React 19 compatible**. ([registry.npmjs.org/react-aria-components](https://registry.npmjs.org/react-aria-components), [ui.shadcn.com/r/index.json](https://ui.shadcn.com/r/index.json))

> **This contradicts my prior expectation.** I expected Radix to still be shadcn's default. It is not — Base UI is, and there are now three bases plus eight named styles (Vega, Nova, Maia, Lyra, Mira, Luma, Rhea, Sera). The repo's `components.json` has `style: "default"`, which is not one of the eight. See [Unresolved Q3](#5-unresolved-questions).

#### b. The exact component list the aria base ships

The registry index at `https://ui.shadcn.com/r/index.json` is authoritative and machine-readable: **63 `registry:ui` items**, each carrying a `meta.links` object with a key per base it supports. An item with a `meta.links.aria` key ships an aria implementation.

**58 of 63 registry components have an aria implementation.** The five that do not:

| Component | `base` | `radix` | `aria` | Note |
|---|:-:|:-:|:-:|---|
| `menubar` | yes | yes | **no** | `docs/components/aria/menubar` → HTTP 404 |
| `navigation-menu` | yes | yes | **no** | `docs/components/aria/navigation-menu` → HTTP 404 |
| `toast` | yes | no | **no** | Base UI only; aria/radix projects use `sonner` instead |
| `form` | — | — | — | No `meta.links` at all; base-agnostic (react-hook-form wrapper) |
| (`attachment`, `bubble`, `marker`, `message`, `message-scroller` are aria-only — no radix equivalent, irrelevant here) | | | | |

On `toast` specifically:

> **Toast follows the project base.** Use `toast` from the `toast` component for Base UI projects. Use `toast()` from `sonner` for Radix and React Aria projects.
> — [skills/shadcn/SKILL.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/SKILL.md)

**A caution on the docs sidebar.** The sidebar on `ui.shadcn.com/docs/components/aria/*` renders the *global* component list, including Menubar and Navigation Menu, even though those pages 404 under `/aria/`. **Do not use the sidebar for this analysis** — use `/r/index.json` and verify with an HTTP status check, as done above.

#### c. Gap analysis — all 46 files in `src/components/ui/`

Buckets:
- **(i)** direct aria equivalent exists
- **(ii)** no aria primitive needed — purely presentational or not Radix-backed, survives untouched
- **(iii)** **no aria equivalent AND currently Radix-backed** → hand-write or keep on Radix ← the risk list

`LIVE` = reachable from application code. `DEAD` = only reachable from other `src/components/ui/` files.

| # | File | Live? | Current primitive | Bucket | aria maps to | Notes |
|--:|---|:-:|---|:-:|---|---|
| 1 | `accordion.tsx` | DEAD | `@radix-ui/react-accordion` | (i) | [DisclosureGroup](https://react-aria.adobe.com/DisclosureGroup#api) | |
| 2 | `alert-dialog.tsx` | DEAD | `@radix-ui/react-alert-dialog` | (i) | [Modal](https://react-aria.adobe.com/Modal#api) | |
| 3 | `alert.tsx` | DEAD | none (div + cva) | (ii) | aria variant exists | presentational |
| 4 | `aspect-ratio.tsx` | DEAD | `@radix-ui/react-aspect-ratio` | (i) | aria variant exists (no API link) | |
| 5 | `avatar.tsx` | DEAD | `@radix-ui/react-avatar` | (i) | aria variant exists | |
| 6 | `badge.tsx` | DEAD | none | (ii) | aria variant exists | presentational |
| 7 | `button.tsx` | DEAD | `@radix-ui/react-slot` | (i) | [Button](https://react-aria.adobe.com/Button#api) | `asChild`→`render` API change |
| 8 | `calendar.tsx` | DEAD | `react-day-picker` 8 | (i) | [Calendar](https://react-aria.adobe.com/Calendar#api) | aria **drops react-day-picker** |
| 9 | `card.tsx` | DEAD | none | (ii) | aria variant exists | presentational |
| 10 | `carousel.tsx` | DEAD | `embla-carousel-react` | (ii) | still [embla](https://www.embla-carousel.com/docs/api) | not a Radix primitive |
| 11 | `checkbox.tsx` | DEAD | `@radix-ui/react-checkbox` | (i) | [Checkbox](https://react-aria.adobe.com/Checkbox#api) | |
| 12 | `collapsible.tsx` | DEAD | `@radix-ui/react-collapsible` | (i) | [Disclosure](https://react-aria.adobe.com/Disclosure#api) | |
| 13 | `command.tsx` | **LIVE** | `cmdk` + `@radix-ui/react-dialog` | (i) | [Autocomplete](https://react-aria.adobe.com/Autocomplete#api) | **aria drops `cmdk`** — real rewrite |
| 14 | `context-menu.tsx` | DEAD | `@radix-ui/react-context-menu` | (i) | [Menu](https://react-aria.adobe.com/Menu#api) | |
| 15 | `dialog.tsx` | **LIVE** | `@radix-ui/react-dialog` | (i) | [Modal](https://react-aria.adobe.com/Modal#api) | |
| 16 | `drawer.tsx` | DEAD | `vaul` | (ii) | aria variant links [Base UI drawer](https://base-ui.com/react/components/drawer.md) | odd mapping; see Unresolved Q4 |
| 17 | `dropdown-menu.tsx` | DEAD | `@radix-ui/react-dropdown-menu` | (i) | [Menu](https://react-aria.adobe.com/Menu#api) | |
| 18 | `form.tsx` | DEAD | `react-hook-form` + Radix label | (ii) | registry item is base-agnostic | |
| 19 | `hover-card.tsx` | DEAD | `@radix-ui/react-hover-card` | (i) | [PreviewTrigger](https://react-aria.adobe.com/PreviewTrigger#api) | |
| 20 | `input.tsx` | DEAD | none (native input) | (ii) | [TextField](https://react-aria.adobe.com/TextField#api) | |
| 21 | `label.tsx` | DEAD | `@radix-ui/react-label` | (i) | [TextField](https://react-aria.adobe.com/TextField#api) | |
| 22 | **`menubar.tsx`** | DEAD | `@radix-ui/react-menubar` | **(iii)** | **none** | `/docs/components/aria/menubar` → **404** |
| 23 | `mode-toggle.tsx` | DEAD | composed (button + dropdown-menu) | (ii) | n/a — not a registry item | local file, not upstream |
| 24 | **`navigation-menu.tsx`** | DEAD | `@radix-ui/react-navigation-menu` | **(iii)** | **none** | `/docs/components/aria/navigation-menu` → **404** |
| 25 | `pagination.tsx` | DEAD | none (links + button) | (ii) | aria variant exists | |
| 26 | `popover.tsx` | DEAD | `@radix-ui/react-popover` | (i) | [Popover](https://react-aria.adobe.com/Popover#api) | |
| 27 | `progress.tsx` | DEAD | `@radix-ui/react-progress` | (i) | [ProgressBar](https://react-aria.adobe.com/ProgressBar#api) | |
| 28 | `radio-group.tsx` | DEAD | `@radix-ui/react-radio-group` | (i) | [RadioGroup](https://react-aria.adobe.com/RadioGroup#api) | |
| 29 | `resizable.tsx` | DEAD | `react-resizable-panels` | (ii) | still [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) | not a Radix primitive |
| 30 | `scroll-area.tsx` | DEAD | `@radix-ui/react-scroll-area` | (i) | aria variant exists (no API link) | |
| 31 | `select.tsx` | DEAD | `@radix-ui/react-select` | (i) | [Select](https://react-aria.adobe.com/Select#api) | |
| 32 | `separator.tsx` | DEAD | `@radix-ui/react-separator` | (i) | [Separator](https://react-aria.adobe.com/Separator#api) | |
| 33 | `sheet.tsx` | DEAD | `@radix-ui/react-dialog` | (i) | [Modal](https://react-aria.adobe.com/Modal#api) | |
| 34 | `skeleton.tsx` | DEAD | none | (ii) | aria variant exists | presentational |
| 35 | `slider.tsx` | DEAD | `@radix-ui/react-slider` | (i) | [Slider](https://react-aria.adobe.com/Slider#api) | |
| 36 | `sonner.tsx` | **LIVE** | `sonner` + `next-themes` | (ii) | still [sonner](https://sonner.emilkowal.ski) | aria's official toast answer |
| 37 | `switch.tsx` | DEAD | `@radix-ui/react-switch` | (i) | [Switch](https://react-aria.adobe.com/Switch#api) | |
| 38 | `table.tsx` | **LIVE** | none (native `<table>`) | (ii) | [Table](https://react-aria.adobe.com/Table#api) exists, but current file is presentational | survives untouched |
| 39 | `tabs.tsx` | DEAD | `@radix-ui/react-tabs` | (i) | [Tabs](https://react-aria.adobe.com/Tabs#api) | |
| 40 | `textarea.tsx` | DEAD | none (native) | (ii) | [TextField](https://react-aria.adobe.com/TextField#api) | |
| 41 | **`toast.tsx`** | DEAD | `@radix-ui/react-toast` | **(iii)** | **none** | registry `toast` is Base-UI-only |
| 42 | **`toaster.tsx`** | DEAD | composed on `toast.tsx` | **(iii)** | **none** | falls with `toast.tsx` |
| 43 | **`use-toast.ts`** | DEAD | composed on `toast.tsx` | **(iii)** | **none** | falls with `toast.tsx` |
| 44 | `toggle.tsx` | DEAD | `@radix-ui/react-toggle` | (i) | [ToggleButton](https://react-aria.adobe.com/ToggleButton#api) | |
| 45 | `toggle-group.tsx` | DEAD | `@radix-ui/react-toggle-group` | (i) | [ToggleButtonGroup](https://react-aria.adobe.com/ToggleButtonGroup#api) | |
| 46 | `tooltip.tsx` | DEAD | `@radix-ui/react-tooltip` | (i) | [Tooltip](https://react-aria.adobe.com/Tooltip#api) | |

**Bucket totals:** (i) 29 · (ii) 12 · **(iii) 5** — `menubar`, `navigation-menu`, `toast`, `toaster`, `use-toast`.

**Bucket (iii) is entirely dead code.** All five are unreachable from the application. The correct resolution for all five is *delete*, not *hand-write* — and `toast`/`toaster`/`use-toast` are superseded by `sonner`, which the repo already uses and which is aria's documented toast story.

**Ticket count for the aria migration, after step 0: four components** — `command` (real rewrite, drops `cmdk` for React Aria `Autocomplete`), `dialog`, `table` (likely no-op), `sonner` (likely no-op).

The `command` rewrite is the only substantive one. `src/components/site/command-menu.tsx` is its sole consumer.

#### d. What `--preset b0` is, and does it overwrite `globals.css`?

**A preset is a design-system configuration**, not a component set:

> A preset packs your entire design system config into a short code, including colors, theme, icon library, fonts, and radius.

Three forms are accepted:

> 1. **Named:** `--preset nova` or `--preset lyra`
> 2. **Code:** `--preset a2r6bw` (version-prefixed base62 string, e.g. `a2r6bw` or `b0`)
> 3. **URL:** `--preset "https://ui.shadcn.com/init?base=radix&style=nova&..."`
> — [skills/shadcn/cli.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/cli.md)

So `b0` is form 2 — an **opaque version-prefixed base62 code**, not a named preset. `b0` appears verbatim in the docs as an example of the code format.

> **IMPORTANT:** Never try to decode, fetch, or resolve preset codes manually. Preset codes are opaque — pass them directly to `npx shadcn@latest init --preset <code>` and let the CLI handle resolution.
> — [cli.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/cli.md)

**Does it overwrite `globals.css` design tokens? Yes, per the official docs.** Two independent statements:

> **Skip** → `npx shadcn@latest init --preset <code> --force --no-reinstall`. Only updates config and CSS variables, leaves existing components as-is.
> — [cli.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/cli.md)

> `apply` — Applies a preset to an existing project, **overwriting preset-driven config, fonts, CSS variables, and detected UI components.**
> — [cli.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/cli.md)

Decoding a preset reveals fields "including style, baseColor, theme, chartColor, iconLibrary, font, radius, and menuColor". ([2026-04-preset-commands](https://ui.shadcn.com/docs/changelog/2026-04-preset-commands)) `theme`, `baseColor`, `radius`, and `font` all land in `globals.css`.

**Concretely at risk in `src/app/globals.css`:** the whole `:root` and `.dark` blocks, and in particular the four non-shadcn tokens the preset knows nothing about — `--brand`, `--brand-foreground`, `--grid`, `--glow` — plus `--radius: 0.4rem`. Also at risk: the `@layer base` scrollbar/selection/focus-visible rules and the `@layer components` `.grid-backdrop` block, if the writer replaces rather than merges.

**Before running anything, decode the code:** `pnpm dlx shadcn@latest preset decode b0`. That is the sanctioned way to see what `b0` actually sets, and it is read-only. I could not do this without executing the CLI, which is out of scope for this pass.

**Also unverified:** whether `b0` is even a currently valid code. It appears in the docs only as a *format example*. See [Unresolved Q2](#5-unresolved-questions).

**Partial apply exists and is the safer tool** if all you want is the theme:

> **Partial**: `npx shadcn@latest apply <code> --only theme,font`. Updates only the selected preset parts without reinstalling UI components. Supported values are `theme` and `font`.
> — [SKILL.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/SKILL.md)

#### e. What `--pointer` does

> The `--pointer` flag enables cursor pointer behavior for buttons during project initialization.
>
> ```css
> @layer base {
>   button:not(:disabled), [role="button"]:not(:disabled) { cursor: pointer; }
> }
> ```
>
> The `--pointer` option is not part of preset codes. It is applied as a project setup option, similar to `--rtl`.
> — [ui.shadcn.com/docs/changelog/2026-04-pointer-cursor](https://ui.shadcn.com/docs/changelog/2026-04-pointer-cursor)

It writes that block into `globals.css`. It exists because Tailwind v4's Preflight changed the button cursor from `pointer` to `default`. ([tailwind upgrade-guide](https://tailwindcss.com/docs/upgrade-guide))

**Relevance here: near zero, and possibly negative.** This repo is on Tailwind v3, whose Preflight does not make that change, so buttons already show a pointer cursor. Passing `--pointer` now adds a redundant `@layer base` block. It only becomes meaningful *after* the Tailwind v4 step. **Recommendation: drop `--pointer` from the init command; add the CSS by hand (or re-run with it) as part of the Tailwind v4 ticket if button cursors regress.** There is also a `--no-pointer` counterpart. ([ui.shadcn.com/docs/cli](https://ui.shadcn.com/docs/cli))

#### f. Is `init` destructive to existing components?

**On `components.json`:** it prompts.

> A components.json file already exists. Would you like to overwrite it?
> — [packages/shadcn/src/commands/init.ts](https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/commands/init.ts)

Declining exits with a message suggesting you remove the file and re-run. `--force` (`-f`, "force overwrite of existing configuration", default `false`) bypasses that prompt. ([ui.shadcn.com/docs/cli](https://ui.shadcn.com/docs/cli), [init.ts](https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/commands/init.ts))

**On existing components in `src/components/ui/`:** controlled by `--reinstall` / `--no-reinstall`, default `false`, and it **prompts** when neither is passed:

> Would you like to re-install existing UI components?
> — [init.ts](https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/commands/init.ts)

With `--reinstall`, init enumerates installed components and **re-downloads and overwrites** those files. With `--no-reinstall`, existing component files are left alone.

**The `--overwrite` / `--force` distinction is real and they are different commands' flags:**

| Flag | Command | Meaning |
|---|---|---|
| `-f, --force` | `init` | overwrite existing **configuration** (`components.json`) without prompting |
| `-o, --overwrite` | `add` | overwrite existing **component files** |
| `--reinstall` | `init` | re-download and overwrite existing **component files** during init |

There is no `--overwrite` on `init` and no `--force` on `add`. ([ui.shadcn.com/docs/cli](https://ui.shadcn.com/docs/cli), [cli.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/cli.md))

**Note the `--yes` default trap:** on `init`, `-y, --yes` ("skip confirmation prompt") **defaults to `true`**, whereas on `add` it defaults to `false`. ([ui.shadcn.com/docs/cli](https://ui.shadcn.com/docs/cli)) I could not determine which of the two prompts above `--yes` suppresses. Treat `init` as capable of running non-interactively by default.

**Can Radix-based and aria-based components coexist during a gradual migration?**

The only direct statement is:

> **Base-specific output** — React Aria state selectors and dependencies are scoped to the Aria registry. **Existing Base UI and Radix components are unchanged.**
> — [2026-07-react-aria changelog](https://ui.shadcn.com/docs/changelog/2026-07-react-aria)

That says an aria init does not *rewrite* your existing Radix files, which strongly implies file-level coexistence is fine — the components are copied source, not a runtime library, and Radix and React Aria have no shared state. But `components.json` holds a **single** `base` field, so `shadcn add <x>` after switching will always pull the aria variant; there is no per-component base override. **Practically: yes, they coexist; you just cannot ask the CLI for a Radix component afterwards without passing `--base radix` explicitly.** Marked **partially unverified** — see [Unresolved Q5](#5-unresolved-questions).

**A note on the proposed command.** The brief's command is:

```
pnpm dlx shadcn@latest init --preset b0 --base aria --template next --pointer
```

`--template` is documented as the template for **creating a new project** — `init` "Initializes shadcn/ui in an existing project or creates a new project (**when `--name` is provided**)". ([cli.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/cli.md)) Every documented `--template` example is paired with `--name`; every "initialize existing project" example omits `--template`. Passing `--template next` without `--name` is undocumented — most likely a no-op, possibly a scaffold attempt. **Recommend dropping `--template next`** and, per (e), `--pointer`. The documented shape for this repo is closer to:

```
pnpm dlx shadcn@latest preset decode b0          # read-only, do this first
pnpm dlx shadcn@latest info                      # record current base/style
pnpm dlx shadcn@latest init --preset b0 --base aria --force --no-reinstall
git diff src/app/globals.css components.json     # then restore custom tokens by hand
```

---

### Q2 — Next.js 14.0.4 → 16

Source of truth: [nextjs.org/docs/app/guides/upgrading/version-16](https://nextjs.org/docs/app/guides/upgrading/version-16), served at `version: 16.3.3`, `lastUpdated: 2026-08-25`. Current npm `next` dist-tag `latest` = **16.3.3**. ([registry.npmjs.org/next](https://registry.npmjs.org/next))

#### Required React version — and a contradiction

The v16 guide does not state a React minimum in so many words. It says:

> The App Router in **Next.js 16** uses the latest React [Canary release](https://react.dev/blog/2023/05/03/react-canaries), which includes the newly released React 19.2 features

and instructs `pnpm add next@latest react@latest react-dom@latest`. The **v15** guide is explicit:

> The minimum versions of `react` and `react-dom` is now 19.
> — [version-15](https://nextjs.org/docs/app/guides/upgrading/version-15)

Since 16 is downstream of 15, **React 19 is mandatory**.

> **However, the published package disagrees.** `next@16.3.3` declares
> `peerDependencies.react: "^18.2.0 || 19.0.0-rc-de68d2f4-20241204 || ^19.0.0"`.
> ([registry.npmjs.org/next](https://registry.npmjs.org/next))
> React 18.2 is still inside the peer range, so **npm/pnpm will not stop you installing Next 16 on React 18**.
> Treat this as a packaging leftover, not permission. Follow the docs: go to React 19.
> Current `react` dist-tag `latest` = **19.2.8**. ([registry.npmjs.org/react](https://registry.npmjs.org/react))

**Also required:** Node.js **20.9+** (Node 18 dropped), TypeScript **5.1.0+**. The repo has Node 22.23.2 and TS 5.1.6 — both pass, TS only just. Browser floor: Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+.

#### Codemods — what they do and do not automate

Primary command:

```bash
pnpm dlx @next/codemod@canary upgrade latest
```

What it does:

> * Update `next.config.js` to use the new `turbopack` configuration
> * Migrate from `next lint` to the ESLint CLI
> * Migrate from deprecated `middleware` convention to `proxy`
> * Remove `unstable_` prefix from stabilized APIs
> * Remove `experimental_ppr` Route Segment Config from pages and layouts

What it explicitly does **not** do:

> The `upgrade` codemod does not run every migration codemod. If your app still uses synchronous `params`, `searchParams`, `cookies()`, `headers()`, or `draftMode()` access from the Next.js 15 compatibility period, also run the async Request APIs codemod:
> ```bash
> npx @next/codemod@canary next-async-request-api .
> ```

Individual codemods relevant here:
- `npx @next/codemod@canary next-lint-to-eslint-cli .` — the `next lint` migration
- `npx @next/codemod@canary agents-md` — writes/updates `AGENTS.md` to point at version-matched docs
- `npx @next/codemod@canary next-async-request-api .` — **not needed here** (zero usages)

**Not automated by any codemod, must be done by hand:** the `revalidateTag` second-argument requirement, parallel-route `default.js` files, the `scroll-behavior` opt-in attribute, `next/image` config defaults, ESLint flat-config migration, and the React 18→19 code changes themselves.

#### Breaking changes that apply to THIS repo

Verified by grep against `src/`:

| Breaking change | Applies here? | Evidence |
|---|:-:|---|
| Async request APIs (`cookies`/`headers`/`draftMode`/`params`/`searchParams`) — sync access **fully removed** in 16 | **No** | zero matches in `src/`. Routes are `/`, `/about`, `/table` — all static, no `[param]` segments |
| `middleware` → `proxy` rename | **No** | no `middleware.ts` |
| `fetch` no longer cached by default (from 15) | **No** | no `fetch()` in app code |
| Route Handler `GET` no longer cached by default | **No** | no `route.ts` handlers (only `robots.ts`, `sitemap.ts`) |
| `next lint` removed | **Yes** | `package.json` has `"lint": "next lint"` |
| ESLint flat config default | **Yes** | repo has `.eslintrc.json` (legacy format) |
| `serverRuntimeConfig` / `publicRuntimeConfig` removed | No | not used |
| AMP removed | No | not used |
| `experimental.dynamicIO` / `useCache` removed | No | not used |
| `devIndicators` options removed | No | not in `next.config.js` |
| Turbopack default for `dev` **and** `build` | **Yes** (implicitly) | no custom webpack config, so no build failure expected |
| Scroll-behavior override change | **Yes, watch this** | `globals.css` sets `html { scroll-behavior: smooth; }` — see below |
| Parallel routes need `default.js` | No | no parallel routes |
| `revalidateTag` needs a `cacheLife` arg | No | not used |

**`next.config.js` key removals/renames affecting this repo: none.** `output: "export"` and `images: { unoptimized: true }` are both untouched by the v16 changes. The v16 `next/image` changes (`minimumCacheTTL` 60s→4h, `imageSizes` dropping `16`, `qualities` defaulting to `[75]`, new `localPatterns.search` requirement, `maximumRedirects` capped at 3, `dangerouslyAllowLocalIP`) **all concern the built-in image optimizer, which is disabled by `unoptimized: true`.** The single `next/image` usage in `src/components/sections/work-section.tsx` is unaffected.

**One subtle live change — scroll behavior.** `src/app/globals.css` sets `html { scroll-behavior: smooth; }`. In Next 16:

> By default, Next.js will **no longer override** your `scroll-behavior` setting during navigation. **If you want Next.js to perform this override** (the previous default behavior), add the `data-scroll-behavior="smooth"` attribute to your `<html>` element

So route transitions will start animating a smooth scroll-to-top instead of jumping. To keep 14's behaviour, add `data-scroll-behavior="smooth"` to `<html>` in `src/app/layout.tsx`. This is a real, user-visible change that no codemod will flag.

#### Is `next lint` removed in 16, and what replaces it?

Yes.

> ### `next lint` Command
> The `next lint` command has been removed. Use Biome or ESLint directly. `next build` no longer runs linting.
>
> A codemod is available to automate migration:
> ```bash
> pnpm dlx @next/codemod@canary next-lint-to-eslint-cli .
> ```
> The `eslint` option in the Next.js config file is also removed.
> — [version-16 guide](https://nextjs.org/docs/app/guides/upgrading/version-16)

Two consequences for this repo:
1. `"lint": "next lint"` in `package.json` must become a direct `eslint` invocation. The codemod does this.
2. `@next/eslint-plugin-next` now defaults to **flat config**:
   > `@next/eslint-plugin-next` now defaults to ESLint Flat Config format, aligning with ESLint v10 which will drop legacy config support. […] If you're using the legacy `.eslintrc` format, consider migrating to the flat config format.

   The repo's `.eslintrc.json` (`{"root": true, "extends": "next/core-web-vitals"}`) is legacy format and should become an `eslint.config.mjs`. Also bump `eslint-config-next` from **13.4.16** — two majors behind `next` even today — to match Next 16.

   Note: `next build` no longer runs lint, so a broken ESLint setup will **not** fail the build. Lint silently stops running rather than erroring. Add an explicit lint step to CI if you care.

#### `output: "export"` — constraints and breakages

**Static export still works in Next 16.** The static-exports doc is served at `version: 16.3.3` / `lastUpdated: 2026-08-25` and its Version History table's most recent entry is `v14.0.0` — i.e. **nothing changed for static export in 15 or 16**. ([nextjs.org/docs/app/guides/static-exports](https://nextjs.org/docs/app/guides/static-exports))

Full unsupported-features list, verbatim:

> * Dynamic Routes with `dynamicParams: true`
> * Dynamic Routes without `generateStaticParams()`
> * Route Handlers that rely on Request
> * Cookies
> * Rewrites
> * Redirects
> * Headers
> * Proxy
> * Incremental Static Regeneration
> * Image Optimization with the default `loader`
> * Draft Mode
> * Server Actions
> * Intercepting Routes
>
> Attempting to use any of these features with `next dev` will result in an error

**None of these are used by this repo.** Note "Proxy" is on the list — the 16-renamed middleware is still export-incompatible, so the `middleware → proxy` rename is irrelevant here.

**On `images.unoptimized` under export:** the doc frames it as "Image Optimization with the default `loader`" being unsupported, and documents a custom-loader escape hatch. `unoptimized: true` is the other valid answer and remains correct. Nothing in the v16 guide changes this.

**Turbopack + export:** no incompatibility is documented anywhere I looked. Turbopack becomes the default build engine, and the static-exports page carries no Turbopack caveat. Treat as compatible, but note it is compatible by *silence*, not by an explicit statement.

**GitHub Pages:** the static-exports page still points at an official template — `https://github.com/nextjs/deploy-github-pages` — as the current recommendation. Worth diffing this repo's hand-rolled `deploy.yml` against it while fixing R3.

#### 14 → 16 direct, or step through 15?

**Direct.** Reasons, in order of weight:

1. The repo uses **none** of the APIs that the 15→16 async-migration is about. Stepping through 15 exists so you can adopt the *temporary synchronous compatibility* shims (`UnsafeUnwrappedCookies` etc.) and migrate gradually. With zero usages there is nothing to stage.
2. Both the v15 and v16 guides give the **same** command — `@next/codemod@canary upgrade latest` — and both are published under `version: 16.3.3`. There is no 14→15-only codemod path to preserve.
3. A 14→15 stop would still require the React 18→19 jump, so it does not decompose the risk; it just adds a second dependency-resolution event.
4. The one genuine argument *for* stepping is bisectability (R3). Given the app's tiny surface, I judge that insufficient. **Unverified:** neither guide states outright whether a two-major jump is supported; I am inferring from the shared `upgrade latest` command.

---

### Q3 — Tailwind 3.3.3 → v4

Source: [tailwindcss.com/docs/upgrade-guide](https://tailwindcss.com/docs/upgrade-guide) and [tailwindcss.com/docs/compatibility](https://tailwindcss.com/docs/compatibility). Current npm `tailwindcss` latest = **4.3.3**; `@tailwindcss/postcss` latest = **4.3.3**. ([registry.npmjs.org/tailwindcss](https://registry.npmjs.org/tailwindcss))

#### The codemod

```bash
npx @tailwindcss/upgrade
```

> **Prerequisites:** Node.js 20 or higher
> — [upgrade-guide](https://tailwindcss.com/docs/upgrade-guide)

Local Node is 22.23.2 — fine. The tool handles the `@tailwind` → `@import` swap, the PostCSS config rewrite, utility renames, the important-modifier reordering, and arbitrary-value syntax changes.

#### PostCSS plugin package change

> In v4, the PostCSS plugin moved to a dedicated package and no longer requires `postcss-import` or `autoprefixer`:
> ```js
> // v4
> export default { plugins: { "@tailwindcss/postcss": {} } };
> ```
> — [upgrade-guide](https://tailwindcss.com/docs/upgrade-guide)

For this repo: `postcss.config.js` currently reads `{ plugins: { tailwindcss: {}, autoprefixer: {} } }`. After: `{ plugins: { "@tailwindcss/postcss": {} } }`. **`autoprefixer` (10.4.15) can be removed from `package.json`** — v4 handles vendor prefixing internally. Next 16's own docs agree exactly:

> ```bash
> pnpm add -D tailwindcss @tailwindcss/postcss
> ```
> ```js filename="postcss.config.mjs"
> export default { plugins: { '@tailwindcss/postcss': {} } }
> ```
> — [nextjs.org/docs/app/getting-started/css](https://nextjs.org/docs/app/getting-started/css)

The `@tailwind base; @tailwind components; @tailwind utilities;` triple at the top of `globals.css` becomes a single `@import "tailwindcss";`.

#### What happens to `tailwind.config.ts`?

It is **not deleted** — there is a documented compatibility path:

> JavaScript config files (`tailwind.config.js`) are no longer auto-detected. Load explicitly using the `@config` directive:
> ```css
> @config "../../tailwind.config.js";
> ```
> — [upgrade-guide](https://tailwindcss.com/docs/upgrade-guide)

> The `@config` and `@plugin` directives may be used in conjunction with `@theme`, `@utility`, and other CSS-driven features. This can be used to incrementally move over your theme, custom configuration, utilities, variants, and presets to CSS.
> — [functions-and-directives](https://tailwindcss.com/docs/functions-and-directives)

**Unsupported from a v3 JS config:** `corePlugins`, `safelist` (use `@source inline()`), `separator`. This repo uses none of the three.

**Applied to this repo's config:** `darkMode: ["class"]`, `content`, `theme.container`, `theme.extend.fontFamily`/`colors`/`borderRadius`/`keyframes`/`animation` can all ride along via `@config` initially, then migrate to `@theme` at leisure. The **plugins array is the problem** (R5): `require("tailwindcss-animate")` plus the hand-written `firefox:` variant plugin. See below.

#### The `--background: 40 20% 99%` bare-HSL-triplet pattern under v4

Two separate questions here, and the answers differ.

**Does `hsl(var(--x))` still work?** Yes — that is plain CSS with no Tailwind involvement. What changes is Tailwind's *side*: in v3 the `hsl(var(--border))` wrappers live in `tailwind.config.ts` under `theme.extend.colors`. In v4's CSS-first model, the equivalent lives in `@theme`. If you keep `tailwind.config.ts` via `@config`, **the existing bare-triplet pattern keeps working unchanged**, because the config still supplies the `hsl()` wrappers. This is the low-risk path and it is worth taking first.

**What does shadcn's own v4 guidance say the block should look like?** It moves the `hsl()` wrapper *out* of config and *into* the variable, then maps into Tailwind's namespace with `@theme inline`:

```css
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(0 0% 3.9%);
}

.dark {
  --background: hsl(0 0% 3.9%);
  --foreground: hsl(0 0% 98%);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```
— [ui.shadcn.com/docs/tailwind-v4](https://ui.shadcn.com/docs/tailwind-v4)

So the token block goes from `--background: 40 20% 99%` to `--background: hsl(40 20% 99%)`, and each token gets a `--color-*` alias inside `@theme inline`. The same page notes shadcn's own defaults moved to **OKLCH** (`"HSL colors are now converted to OKLCH"`), but the documented pattern still accepts `hsl()` values — you are not forced to convert the palette's colour space.

**Practical consequence for the four custom tokens.** `--brand`, `--brand-foreground`, `--grid`, `--glow` are currently consumed two ways: via `tailwind.config.ts` (`colors.brand`, giving `bg-brand`) and via raw CSS (`hsl(var(--glow))`, `hsl(var(--brand) / 0.25)` in `::selection`, `hsl(var(--grid))` in `.grid-backdrop`). Wrapping the variable in `hsl()` **breaks the raw-CSS call sites** — `hsl(hsl(158 72% 30%) / 0.25)` is invalid. Under the shadcn v4 pattern the slash-opacity form becomes `--brand` used directly with a relative-colour or `color-mix()` form. **This is the fiddliest single piece of the Tailwind migration and the codemod will not do it for you.** Budget a dedicated pass over `::selection`, `.grid-backdrop`, and the scrollbar rules.

**Other v4 changes that touch this repo's CSS:**
- `theme()` calls should become `var(--color-*)`; in media queries, `@media (width >= theme(--breakpoint-xl))`
- Border/divide/ring default colour changed from `gray-200`/`blue-500` to **`currentColor`** — the `* { @apply border-border }` rule in `@layer base` already sets borders explicitly, so this should be neutral here, but verify
- Placeholder colour now derives from current text colour at 50% opacity
- Variant stacking now applies **left-to-right** (was right-to-left)
- Arbitrary CSS-variable syntax: `bg-[--brand]` → `bg-(--brand)`. **Grep found zero `[--x]` occurrences in `src/`**, so this does not apply
- v4 is **not compatible with Sass/Less/Stylus**. Not used here

#### `tailwindcss-animate` under v4

Deprecated, with a named replacement:

> The documentation states that `tailwindcss-animate` has been deprecated in favor of `tw-animate-css`. New projects include `tw-animate-css` by default.
> — [ui.shadcn.com/docs/tailwind-v4](https://ui.shadcn.com/docs/tailwind-v4)

That is shadcn's statement, not the Tailwind team's — `tailwindcss-animate` is a third-party plugin and shadcn is its main consumer, so this is the closest thing to a primary source. Supporting evidence: `tailwindcss-animate@1.0.7` (latest, unchanged) still declares `peerDependencies: { tailwindcss: ">=3.0.0 || insiders" }` — it will *install* against v4 but has had no v4-era release. `tw-animate-css@1.4.0` has **no peer dependencies at all**, consistent with being a pure CSS import rather than a JS plugin. ([registry.npmjs.org/tailwindcss-animate](https://registry.npmjs.org/tailwindcss-animate), [.../tw-animate-css](https://registry.npmjs.org/tw-animate-css))

**Consequence for this repo:** `tailwind.config.ts` does `require("tailwindcss-animate")` and `globals.css` / components rely on `animate-in`, `fade-in`, etc. (heavily, throughout `src/components/ui/`). Swapping to `tw-animate-css` means a CSS `@import` instead of a config plugin. Since most consumers are dead files, the live blast radius is small — but check `src/components/site/*` and `src/lib/scroll-motion.ts` for animate-* classes before assuming.

**Not confirmed:** whether `tailwindcss-animate` actually still *functions* under v4 loaded via `@plugin`. I found no primary statement either way.

#### Tailwind v4 browser support baseline

> **Tailwind CSS v4.0 requires these minimum browser versions:**
> - **Chrome 111** *(released March 2023)*
> - **Safari 16.4** *(released March 2023)*
> - **Firefox 128** *(released July 2024)*
>
> "Tailwind CSS v4.0 is designed for and tested on modern browsers, and the core functionality of the framework specifically depends on these browser versions."
> — [tailwindcss.com/docs/compatibility](https://tailwindcss.com/docs/compatibility)

> If you need to support older browsers, stick with v3.4 until your browser support requirements change.
> — [upgrade-guide](https://tailwindcss.com/docs/upgrade-guide)

**The actual floor for this portfolio after both upgrades:** Chrome/Edge **111+**, Safari **16.4+**, Firefox **128+** — the union of Next 16's floor and Tailwind v4's, with Firefox set by Tailwind.

---

### Cross-cutting

#### Does the current shadcn CLI require Tailwind v4? Can it still target v3?

**It still supports v3.** Evidence: the `shadcn info` command reports a `tailwindVersion` field with values `"v3"` or `"v4"`, and a `tailwindConfigFile` path — a CLI that had dropped v3 would not need to distinguish. ([skills/shadcn/cli.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/cli.md)) Corroborating, from shadcn's own Tailwind v4 page:

> this is non-breaking. Your existing apps with Tailwind v3 and React 18 will still work. When you add new components, they'll still be in v3 and React 18 until you upgrade.
> — [ui.shadcn.com/docs/tailwind-v4](https://ui.shadcn.com/docs/tailwind-v4)

**Caveat:** that quote dates from the v4 launch period, well before the current CLI v4 / Base UI / React Aria era, and the [CLI v4 changelog](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) does not restate it. The `tailwindVersion` field in the *current* skill docs is the stronger evidence. Also note the aria base's components are authored against modern shadcn conventions — whether an aria component's CSS renders correctly under Tailwind v3 is **unverified**. Verify empirically with `shadcn add command --dry-run` before committing to the shadcn-before-Tailwind ordering; if the emitted CSS is v4-only, swap steps 2 and 3.

#### React 19 vs the 27 `@radix-ui/*` packages

All current Radix packages declare `peerDependencies.react: "^16.8 || ^17.0 || ^18.0 || ^19.0 || ^19.0.0-rc"` — spot-checked `react-dialog@1.1.23`, `react-dropdown-menu@2.1.24`, `react-select@2.3.7`, `react-accordion@1.2.20`, and the unified `radix-ui@1.6.7`. ([registry.npmjs.org](https://registry.npmjs.org/@radix-ui/react-dialog)) **React 19 is supported across the board.**

The repo's specifiers are already carets (`^1.0.5` etc.), so a fresh resolve reaches React-19-compatible versions. **But `pnpm-lock.yaml` pins the current resolutions**, so an `install` alone will not move them — you need `pnpm update "@radix-ui/*"` (or delete the lockfile) as part of the React 19 ticket. After step 0, only `@radix-ui/react-dialog` remains live.

#### React 19 / Tailwind v4 status of every pinned dep in question

| Package | Pinned | Latest | React 19 at pinned? | Target | Live after step 0? | Source |
|---|---|---|:-:|---|:-:|---|
| `cmdk` | ^0.2.0 | 1.1.1 | **No** (`^18.0.0`) | `1.1.1` (`^18 \|\| ^19`) | **Yes** (`command.tsx`) — or drop entirely if moving to aria `Autocomplete` | [npm](https://registry.npmjs.org/cmdk) |
| `vaul` | ^0.8.0 | 1.1.2 | **No** | `1.1.2` (adds `^19.0.0`) | No — `drawer.tsx` is dead | [npm](https://registry.npmjs.org/vaul) |
| `embla-carousel-react` | `8.0.0-rc17` (exact) | 8.6.0 | **No** | `8.6.0` (adds `^19.0.0`) | No — `carousel.tsx` is dead | [npm](https://registry.npmjs.org/embla-carousel-react) |
| `react-day-picker` | ^8.10.0 | 10.0.1 | **No** | `9.x`/`10.x` (`react: ">=16.8.0"`) | No — `calendar.tsx` is dead | [npm](https://registry.npmjs.org/react-day-picker) |
| `sonner` | ^1.3.1 | 2.0.8 | **No** (`^18.0.0`) | `2.0.8` (`^18 \|\| ^19`) | **Yes** (`sonner.tsx`, layout) | [npm](https://registry.npmjs.org/sonner) |
| `react-resizable-panels` | ^1.0.6 | 4.12.3 | **No** | `4.x` (`^18 \|\| ^19`) | No — `resizable.tsx` is dead | [npm](https://registry.npmjs.org/react-resizable-panels) |
| `tailwind-merge` | ^1.14.0 | 3.6.0 | n/a (no react peer) | **`3.x` — required for Tailwind v4** | **Yes** (`lib/utils.ts`) | [releases](https://api.github.com/repos/dcastil/tailwind-merge/releases) |
| `next-themes` | ^0.2.1 | 0.4.6 | peer is `"*"` — installs, but untested | `0.4.6` (`^18 \|\| ^19`); also fixes the `dist/types` import | **Yes** (layout, `sonner.tsx`, `theme-toggle.tsx`) | [npm](https://registry.npmjs.org/next-themes), [releases](https://api.github.com/repos/pacocoursey/next-themes/releases) |
| `lucide-react` | ^0.268.0 | 1.37.0 | **No** | `1.x` (adds `^19.0.0`) — **major-version jump, icon names may have changed** | **Yes** (26 import sites) | [npm](https://registry.npmjs.org/lucide-react) |
| `react-hook-form` | ^7.49.2 | 7.86.0 | n/a at pinned; latest allows `^19` | `7.86.0`, or delete | No — `form.tsx` is dead | [npm](https://registry.npmjs.org/react-hook-form) |
| `class-variance-authority` | ^0.7.0 | 0.7.1 | no react peer | `0.7.1` | Yes | [npm](https://registry.npmjs.org/class-variance-authority) |
| `@mantine/core` | ^6.0.19 | 9.5.2 | **Yes** at 6.0.22 (`>=16.8.0`) | delete | Yes (table page) | [npm](https://registry.npmjs.org/@mantine/core) |
| `mantine-react-table` | ^1.1.1 | 1.3.4 | **Yes** at 1.3.4 (`>=18.0`) | delete | Yes (table page) | [npm](https://registry.npmjs.org/mantine-react-table) |

**`lucide-react` 0.268 → 1.x deserves its own ticket.** It is the only *live* dependency crossing a major version, it is imported in 26 places, and icon renames between a `0.x` and `1.x` line are plausible. Diff the icon names used against the 1.x export list before assuming it is a version bump.

#### Mantine: delete first, or later?

**Later, or whenever — it does not block.** Both `@mantine/core@6.0.22` (`react: ">=16.8.0"`) and `mantine-react-table@1.3.4` (`react: ">=18.0"`) accept React 19 by their declared ranges, so `pnpm install` will succeed. This contradicts the brief's premise that Mantine "must still install while the other upgrades land — or be deleted first"; there is no install-time conflict to route around.

**Runtime compatibility is Unverified.** Mantine 6 is Emotion-based, and I found no primary statement from the Mantine project about React 19 support for the 6.x line (Mantine is now at 9.5.2, whose peer is `react: "^19.2.0"`). If `/table` breaks under React 19, deleting `mantine-react-table` becomes the fix rather than a cleanup — so keep the deletion ticket ready to pull forward.

---

## 5. Unresolved questions

Things I could not settle from a primary source. Each states what I tried.

1. **Does `--base aria` take effect on an existing project, or does the CLI preserve the base from `components.json`?**
   The docs say "The CLI automatically preserves the current base (`base` vs `radix`) from `components.json`", but that sentence is scoped to `apply` and predates the aria release (it lists only two bases). This repo's `components.json` has no `base` field at all, so what gets inferred is unknown. I read [cli.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/cli.md), [SKILL.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/SKILL.md), [docs/cli](https://ui.shadcn.com/docs/cli), and the [aria changelog](https://ui.shadcn.com/docs/changelog/2026-07-react-aria); none address it. **Resolve by running `shadcn info` before and after and checking the `base` field.**

2. **What does preset code `b0` actually contain, and is it currently valid?**
   `b0` appears in the docs only as an *example of the code format*, never with its decoded contents. The docs explicitly forbid decoding codes by hand ("Preset codes are opaque"). I probed `https://ui.shadcn.com/r/presets.json`, `/r/b0.json`, `/r/presets/b0.json`, `/r/themes/b0.json` — all 404. **Resolve by running `pnpm dlx shadcn@latest preset decode b0`, which is read-only and safe.** Until then, treat "what `--preset b0` sets" as unknown, including whether it is a valid code at all.

3. **What does `style: "default"` map to under the new eight-style system?**
   The aria changelog names eight styles: Vega, Nova, Maia, Lyra, Mira, Luma, Rhea, Sera. `"default"` is not among them; `--defaults` is documented as `--template=next --preset=base-nova` in one place and `--preset=nova` in another. Whether the CLI silently migrates `"default"` → one of the eight, errors, or leaves it is not documented anywhere I found.

4. **Why does the aria `drawer` component's API link point at Base UI's drawer, not React Aria?**
   In `/r/index.json`, `drawer.meta.links.aria.api` is `https://base-ui.com/react/components/drawer.md` — the only aria entry pointing outside `react-aria.adobe.com`. This may mean the aria drawer is implemented on Base UI, or it may be a data error in the registry. Irrelevant here (`drawer.tsx` is dead) but worth knowing if a drawer is ever added.

5. **Can Radix- and aria-based components literally coexist in one `src/components/ui/` directory?**
   The changelog's "Existing Base UI and Radix components are unchanged" strongly implies yes, and there is no technical mechanism that would prevent it (these are copied source files with no shared runtime). But no doc states it outright, and `components.json` holds only one `base` value. I checked the aria changelog, cli.md, SKILL.md, and docs/cli.

6. **Does `init --preset` write to `globals.css` or not?**
   [cli.md](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/cli.md) says the skip flow "Only updates config and CSS variables". A reading of [init.ts](https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/commands/init.ts) suggests init writes only `components.json`, with CSS changes deferred to `addComponents`. These cannot both be right. I assumed the destructive reading throughout. **Resolve by running on a clean git tree and diffing.**

7. **Which prompt(s) does `init`'s `--yes` (default `true`) suppress?**
   `init` has two documented prompts (overwrite `components.json`; re-install existing components) and `--yes` defaults to `true` on `init` but `false` on `add`. Whether `--yes` auto-accepts either prompt — and if so with which answer — is not documented. This determines whether the proposed command is silently destructive.

8. **Do legacy `addVariant` plugins with function callbacks work under Tailwind v4?**
   The repo's `firefox:` variant plugin destructures `{ container, separator }` and uses `postcss`. [functions-and-directives](https://tailwindcss.com/docs/functions-and-directives) confirms `@config` and `@plugin` load legacy configs and plugins, but says nothing about this specific callback signature. Failure mode is silent. **Resolve by grepping for `firefox:` usage and visually diffing those elements in Firefox after the migration**, or by rewriting the variant as a native `@custom-variant`.

9. **Does `tailwindcss-animate` still function under Tailwind v4 via `@plugin`?**
   Its peer range (`tailwindcss: ">=3.0.0"`) permits v4 and it would install, but it has had no v4-era release and shadcn calls it deprecated. No primary source confirms or denies runtime behaviour under v4.

10. **Does Mantine 6.x actually work at runtime under React 19?**
    Peer ranges permit it. No statement from the Mantine project about React 19 support for the 6.x line was findable. `/table` is the only page affected.

11. **Do aria-base components render correctly under Tailwind v3?**
    This is load-bearing for the recommended step order (shadcn before Tailwind). The `tailwindVersion: "v3" | "v4"` field in `shadcn info` proves the CLI *handles* v3, but not that the aria registry's CSS is v3-compatible. **Resolve with `shadcn add command --dry-run` / `--view` and read the emitted CSS.**

12. **Is a two-major Next.js jump (14 → 16) officially supported?**
    Neither the v15 nor v16 guide says. Both give the same `upgrade latest` command, which is suggestive but not a statement.

13. **`@next/codemod@canary`** — every codemod command in the official guides pins `@canary`, not `@latest`. Whether a stable channel exists for these is not stated. Running canary tooling against production source is itself a small risk worth noting.

---

## 6. Sources

Every URL below was actually fetched during this pass.

**Next.js**
- https://nextjs.org/docs/app/guides/upgrading/version-16
- https://nextjs.org/docs/app/guides/upgrading/version-15
- https://nextjs.org/docs/app/guides/static-exports
- https://nextjs.org/docs/app/getting-started/css
- https://nextjs.org/docs/app/guides/tailwind-v4 *(404 — does not exist; the Tailwind v4 setup lives on the CSS page above)*

**Tailwind CSS**
- https://tailwindcss.com/docs/upgrade-guide
- https://tailwindcss.com/docs/compatibility
- https://tailwindcss.com/docs/functions-and-directives

**shadcn/ui**
- https://ui.shadcn.com/docs/cli
- https://ui.shadcn.com/docs/tailwind-v4
- https://ui.shadcn.com/docs/changelog/2026-07-react-aria
- https://ui.shadcn.com/docs/changelog/2026-04-pointer-cursor
- https://ui.shadcn.com/docs/changelog/2026-04-preset-commands
- https://ui.shadcn.com/docs/changelog/2026-03-cli-v4
- https://ui.shadcn.com/docs/components/aria/accordion
- https://ui.shadcn.com/r/index.json *(the registry index — the gap analysis is derived from this)*
- https://ui.shadcn.com/docs/presets *(404)*
- https://ui.shadcn.com/r/registry.json, /r/presets.json, /r/b0.json, /r/presets/b0.json, /r/themes/b0.json, /r/aria.json, /r/aria/button.json *(all 404)*
- HTTP status probes on `https://ui.shadcn.com/docs/components/aria/{accordion,menubar,navigation-menu,toast,form,command,context-menu,drawer,hover-card,carousel,resizable,sonner,toggle-group,pagination}`

**shadcn/ui GitHub**
- https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/cli.md
- https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/SKILL.md
- https://github.com/shadcn-ui/ui/blob/main/packages/shadcn/src/commands/init.ts

**npm registry**
- https://registry.npmjs.org/next
- https://registry.npmjs.org/react
- https://registry.npmjs.org/tailwindcss
- https://registry.npmjs.org/@tailwindcss/postcss
- https://registry.npmjs.org/react-aria-components
- https://registry.npmjs.org/tailwindcss-animate
- https://registry.npmjs.org/tw-animate-css
- https://registry.npmjs.org/cmdk
- https://registry.npmjs.org/vaul
- https://registry.npmjs.org/embla-carousel-react
- https://registry.npmjs.org/react-day-picker
- https://registry.npmjs.org/sonner
- https://registry.npmjs.org/react-resizable-panels
- https://registry.npmjs.org/tailwind-merge
- https://registry.npmjs.org/next-themes
- https://registry.npmjs.org/lucide-react
- https://registry.npmjs.org/shadcn
- https://registry.npmjs.org/@radix-ui/react-dialog
- https://registry.npmjs.org/@radix-ui/react-dropdown-menu
- https://registry.npmjs.org/@radix-ui/react-select
- https://registry.npmjs.org/@radix-ui/react-accordion
- https://registry.npmjs.org/radix-ui
- https://registry.npmjs.org/@mantine/core
- https://registry.npmjs.org/mantine-react-table
- https://registry.npmjs.org/@tabler/icons-react
- https://registry.npmjs.org/@hookform/resolvers
- https://registry.npmjs.org/react-hook-form
- https://registry.npmjs.org/class-variance-authority

**GitHub API**
- https://api.github.com/repos/dcastil/tailwind-merge/releases
- https://api.github.com/repos/pacocoursey/next-themes/releases

**Local (this worktree)**
- `package.json`, `components.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `.eslintrc.json`, `.github/workflows/deploy.yml`, `src/app/globals.css`, `src/app/layout.tsx`, `src/components/theme-provider.tsx`, full `src/` import graph
