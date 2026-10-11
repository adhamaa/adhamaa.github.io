# A Git-based CMS on the static export

Content (Profile, Projects with their Case Studies, Roles and Stack Groups) moves out of `src/data/*.ts` into YAML and Markdown files under the repo, edited through Sveltia CMS at `/admin`. Every save commits straight to `master`, so the existing pipeline is the publish step: `verify` gates `deploy`, and an edit that breaks the build never reaches the live Site. We chose this because the owner is the only editor, wants to edit from a phone, and the Site stays a static export on GitHub Pages — there is no server for a CMS to run on, and the content is too small to justify a database.

## Considered Options

- **Pages CMS** (hosted, one `.pages.yml`): equally workable and needs no infrastructure, but the editor lives on someone else's domain and depends on their service. It is the fallback if running the login Worker becomes a chore.
- **Keystatic**: its GitHub mode needs API routes, which `output: "export"` cannot serve.
- **TinaCMS, Sanity, Payload, Strapi**: each adds a backend or hosted service plus rebuild webhooks, for about four content files.
- **Pull request per save**: safer, but every phone edit would need a second trip to GitHub to merge, and `verify` already protects the live Site.

## Consequences

- **Login needs an OAuth Worker.** GitHub Pages cannot complete GitHub's OAuth flow, so the off-the-shelf `sveltia-cms-auth` Worker runs on Cloudflare, outside this repo, with a GitHub OAuth App registered by hand.
- **A broken edit blocks later deploys** until it is fixed, because it sits on `master` even though it never deployed.
- **The build is the schema.** Content is validated at build time; countable rules (a required, unique Slug; two to four highlights; a non-empty stack) fail `verify`, while matters of style are only hints in the editor. Project screenshots that are not 1344×614 WebP fail `verify` too.
- **A Project's identity is its Slug**, set once and never changed; the two-digit number on the page is its position in the list.
- **CMS commits use the `content:` type**, which release-please ignores, so editing Content never cuts a release.
- **The Résumé PDF is not generated from Content** and can drift out of sync with Roles. That is a known gap, not an oversight.
