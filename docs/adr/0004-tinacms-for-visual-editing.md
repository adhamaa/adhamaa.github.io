# TinaCMS for visual, click-to-edit editing

Supersedes ADR 0003's choice of editor. Its other decisions stand: Content stays in the repository, every save commits to `master` with a `content:` message, and the build is the schema.

The owner found Sveltia's form-beside-a-preview editing not enough. They wanted:

- to edit on the real, themed page;
- to click text on that page to edit it;
- a more polished editor;
- richer Case Studies.

Content had to stay in GitHub. TinaCMS is the Git-based editor that does visual, click-to-edit editing on a static site, so `/admin` now runs TinaCMS, signing in through the free Tina Cloud plan.

## Considered Options

- **Keep Sveltia and add a styled preview:** the least work, but no click-to-edit and the same form-first editor.
- **Sanity or Storyblok:** the most polished visual editors, but Content would leave the repository for their service, with rebuild webhooks and a second source of truth.
- **Clerk for sign-in:** rejected earlier, because it can only release a GitHub token through a server of our own.

## Consequences

- **Tina Cloud is a dependency.** It handles sign-in and live editing, free for two users. CI builds the editor with `NEXT_PUBLIC_TINA_CLIENT_ID` and the `TINA_TOKEN` secret. A push to `master` without them fails the build rather than deploying an editor nobody can sign in to. Content itself never lives in Tina Cloud: the build reads the repository.
- **Case Studies are MDX.** Blocks (Figure, Callout, Gallery) are Tina rich-text templates defined once in `src/content/blocks.mts` for both the editor and the content loader. The loader parses each Case Study into Tina's tree and checks its Blocks, and the page renders that tree with the same components the editor shows, so there is one renderer.
- **Roles and Stack Groups sit under a key** (`roles:`, `groups:`), because Tina can't edit a file whose top level is a bare list.
- **Click-to-edit costs some client JavaScript.**
  - Sections that show Content read it through `useTina`: the work list, Experience and Stack as small client components, and the hero, About, Approach and Contact through tiny text islands fed by one provider in the layout.
  - Visitors get the build's Content back unchanged, and markers render only in edit mode.
  - On the home page this is about 14 KB gzipped of Tina code.
- **Tina's interface is only partly themeable.** Tina 3 colours its interface with fixed Tailwind classes, not variables, so the brand green is applied by recolouring those classes, colours only. If an upgrade renames one, that piece falls back to Tina's orange or blue; layout can't break. A full dark skin was deliberately left out.
- **Sveltia is retired.** It stayed at `/sveltia` while TinaCMS proved itself in production, and was removed on 2026-10-12 once the owner had signed in to TinaCMS in production. Its `sveltia-cms-auth` Worker, the Worker's repository and the "adhamaa.github.io CMS" OAuth App go with it.
