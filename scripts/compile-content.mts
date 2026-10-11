/**
 * Validates the Site's Content and compiles it to JSON for the pages to import.
 *
 * Runs before `next dev`, `next build` and `tsc`, so the compiled JSON always
 * exists and always matches the Content files. Any broken rule stops here, with
 * a message naming the file and field — which fails `verify` in CI, so a bad
 * edit never deploys.
 *
 * Case Studies are written to a file of their own, so their HTML is only ever
 * pulled in by the pages that render them, never by the client bundle.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { loadContent } from "../src/content/load.mts";

const root = join(import.meta.dirname, "..");
const result = loadContent(root);

if (!result.ok) {
  console.error(`\nContent has ${result.errors.length} problem(s):\n`);
  for (const { file, field, message } of result.errors) {
    console.error(`  ${file} › ${field}: ${message}`);
  }
  console.error("");
  process.exit(1);
}

const out = join(root, "src", "data", "generated");
mkdirSync(out, { recursive: true });

const { profile, roles, stackGroups, projects, caseStudies } = result.content;
const write = (name: string, value: unknown) =>
  writeFileSync(join(out, name), JSON.stringify(value, null, 2) + "\n");

write("profile.json", profile);
write("roles.json", roles);
write("stack.json", stackGroups);
write("projects.json", projects);
write("case-studies.json", caseStudies);
// Just enough for the command palette, which ships to the client.
write(
  "case-study-links.json",
  projects.filter((p) => p.hasCaseStudy).map(({ slug, name }) => ({ slug, name }))
);

console.log(
  `Content OK: ${projects.length} Projects, ${caseStudies.length} Case Studies, ${roles.length} Roles, ${stackGroups.length} Stack Groups.`
);
