import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { loadContent } from "./load.mts";

/**
 * Each test builds a small Site on disk — Content files plus the public assets
 * they point at — and reads back what the loader makes of it. Nothing here
 * reaches into the loader; the files in and the result out are the contract.
 */
type Files = Record<string, string | Buffer | null>;

const screenshot = readFileSync(join(import.meta.dirname, "../../public/screenshots/sharah-cmpro.webp"));

const profile = `
name: Ada Example
shortName: Ada E
handle: ada
role: Full-Stack Engineer
focus: React · Hono
location: Pahang, Malaysia
timezone: GMT+8
available: true
availableLabel: Available now
email: ada@example.com
phone: "+60 12-000 0000"
siteUrl: https://ada.example.com
resumeUrl: /resume.pdf
coverLetterUrl: /cover-letter.pdf
tagline: I ship business software end to end.
stats:
  - { value: "3", label: Platforms built solo }
bio:
  - First paragraph.
capabilities:
  - Internal tools
now:
  - Building on the edge.
principles:
  - { title: I own the whole slice, body: Schema to deploy. }
`;

const roles = `
roles:
  - title: Founder & Developer
    company: Example Works
    location: Malaysia
    period: Sep 2026 — present
    summary: Runs the business.
    points: [Builds things.]
    stack: [React]
    current: true
`;

const stack = `
groups:
  - title: Frontend
    note: what users touch
    items: [React, TypeScript]
`;

function project(fields: Record<string, unknown> = {}, body = ""): string {
  const base: Record<string, unknown> = {
    name: "Example",
    order: 1,
    kicker: "A thing I built",
    problem: "Something was hard.",
    build: "I built a fix.",
    role: "Solo",
    year: "2026",
    status: "active",
    stack: ["React", "Hono"],
    highlights: ["First point", "Second point"],
    ...fields,
  };
  const yaml = Object.entries(base)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n");
  return `---\n${yaml}\n---\n${body}`;
}

function site(files: Files = {}): string {
  const root = mkdtempSync(join(tmpdir(), "content-"));
  const all: Files = {
    "content/profile.yml": profile,
    "content/roles.yml": roles,
    "content/stack.yml": stack,
    ...files,
  };
  for (const [path, contents] of Object.entries(all)) {
    if (contents === null) continue;
    const full = join(root, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, contents);
  }
  return root;
}

function load(files: Files = {}) {
  return loadContent(site(files));
}

function content(files: Files = {}) {
  const result = load(files);
  assert.ok(result.ok, `expected valid Content, got ${JSON.stringify(!result.ok && result.errors)}`);
  return result.content;
}

test("returns Projects in order, each named by the Slug in its file name", () => {
  const { projects } = content({
    "content/projects/second-thing.mdx": project({ name: "Second thing", order: 2 }),
    "content/projects/first-thing.mdx": project({ name: "First thing", order: 1 }),
  });

  assert.deepEqual(
    projects.map((p) => [p.slug, p.name]),
    [
      ["first-thing", "First thing"],
      ["second-thing", "Second thing"],
    ]
  );
});

test("leaves Draft Projects out entirely", () => {
  const { projects } = content({
    "content/projects/published.mdx": project({ name: "Published" }),
    "content/projects/unfinished.mdx": project({ name: "Unfinished", draft: true }),
  });

  assert.deepEqual(projects.map((p) => p.slug), ["published"]);
});

function errors(files: Files) {
  const result = load(files);
  assert.ok(!result.ok, "expected the Content to be rejected");
  return result.errors;
}

for (const count of [1, 5]) {
  test(`rejects a Project with ${count} highlight(s), naming the file and field`, () => {
    const highlights = Array.from({ length: count }, (_, i) => `Point ${i + 1}`);

    assert.deepEqual(errors({ "content/projects/thin.mdx": project({ highlights }) }), [
      {
        file: "content/projects/thin.mdx",
        field: "highlights",
        message: `needs 2 to 4 highlights (has ${count})`,
      },
    ]);
  });
}

test("rejects a Project with an empty stack", () => {
  assert.deepEqual(errors({ "content/projects/bare.mdx": project({ stack: [] }) }), [
    { file: "content/projects/bare.mdx", field: "stack", message: "needs at least one tool" },
  ]);
});

test("rejects a Status other than shipped, active or archived", () => {
  assert.deepEqual(errors({ "content/projects/odd.mdx": project({ status: "live" }) }), [
    {
      file: "content/projects/odd.mdx",
      field: "status",
      message: "must be shipped, active or archived",
    },
  ]);
});

test("rejects a Slug that can't be an address", () => {
  assert.deepEqual(errors({ "content/projects/My Project.mdx": project() }), [
    {
      file: "content/projects/My Project.mdx",
      field: "slug",
      message: "must be lowercase letters, digits and hyphens, like my-project",
    },
  ]);
});

/** The smallest extended-format (VP8X) WebP header that declares a size. */
function webpHeader(width: number, height: number): Buffer {
  const header = Buffer.alloc(30);
  header.write("RIFF", 0, "ascii");
  header.writeUInt32LE(22, 4);
  header.write("WEBP", 8, "ascii");
  header.write("VP8X", 12, "ascii");
  header.writeUInt32LE(10, 16);
  header.writeUIntLE(width - 1, 24, 3);
  header.writeUIntLE(height - 1, 27, 3);
  return header;
}

test("accepts a 1344×614 WebP screenshot", () => {
  const { projects } = content({
    "content/projects/shown.mdx": project({ image: "/screenshots/shown.webp", imageAlt: "A screen" }),
    "public/screenshots/shown.webp": screenshot,
  });

  assert.equal(projects[0].image, "/screenshots/shown.webp");
});

test("rejects a screenshot that isn't in public/", () => {
  assert.deepEqual(errors({ "content/projects/lost.mdx": project({ image: "/screenshots/lost.webp" }) }), [
    {
      file: "content/projects/lost.mdx",
      field: "image",
      message: "points to /screenshots/lost.webp, which isn't in public/",
    },
  ]);
});

test("rejects a screenshot that isn't WebP", () => {
  assert.deepEqual(
    errors({
      "content/projects/png.mdx": project({ image: "/screenshots/png.webp" }),
      "public/screenshots/png.webp": Buffer.from("\x89PNG\r\n\x1a\n0000000000000000000000", "latin1"),
    }),
    [{ file: "content/projects/png.mdx", field: "image", message: "must be a WebP image" }]
  );
});

test("rejects a screenshot that isn't 1344×614", () => {
  assert.deepEqual(
    errors({
      "content/projects/small.mdx": project({ image: "/screenshots/small.webp" }),
      "public/screenshots/small.webp": webpHeader(800, 600),
    }),
    [{ file: "content/projects/small.mdx", field: "image", message: "must be 1344×614 (is 800×600)" }]
  );
});

test("publishes a Project's body as its Case Study unless either is a Draft", () => {
  const { projects, caseStudies } = content({
    "content/projects/told.mdx": project({}, "## How it began\n\nIt began."),
    "content/projects/untold.mdx": project(),
    "content/projects/half-told.mdx": project({ caseStudyDraft: true }, "## Not yet"),
    "content/projects/hidden.mdx": project({ draft: true }, "## Hidden"),
  });

  assert.deepEqual(
    projects.map((p) => [p.slug, p.hasCaseStudy]),
    [
      ["half-told", false],
      ["told", true],
      ["untold", false],
    ]
  );
  assert.deepEqual(caseStudies, [
    {
      slug: "told",
      body: {
        type: "root",
        children: [
          { type: "h2", children: [{ type: "text", text: "How it began" }] },
          { type: "p", children: [{ type: "text", text: "It began." }] },
        ],
      },
    },
  ]);
});

test("rejects a Case Study image over 500 KB, and accepts one under it", () => {
  assert.deepEqual(
    errors({
      "content/projects/told.mdx": project({}, "![Screen](/case-studies/told/big.jpg)"),
      "public/case-studies/told/big.jpg": Buffer.alloc(600 * 1024),
      "public/case-studies/told/fine.jpg": Buffer.alloc(400 * 1024),
    }),
    [
      {
        file: "public/case-studies/told/big.jpg",
        field: "size",
        message: "is 600 KB; Case Study images must be 500 KB or smaller",
      },
    ]
  );
});

test("treats an optional field the editor left empty as absent", () => {
  const { projects } = content({
    "content/projects/plain.mdx": project({ image: null, imageAlt: "", repo: "", live: null }),
  });

  assert.equal(projects[0].image, undefined);
  assert.equal(projects[0].repo, undefined);
});

test("reports unreadable front matter once, not again as a missing Project", () => {
  const found = errors({ "content/projects/broken.mdx": "---\nbuild: Three apps: one API\n---\n" });

  assert.equal(found.length, 1);
  assert.equal(found[0].field, "(front matter)");
});

test("rejects Roles written as a bare list, pointing at the key they belong under", () => {
  assert.deepEqual(
    errors({ "content/roles.yml": "- title: Founder\n  company: Example Works\n" }),
    [{ file: "content/roles.yml", field: "roles", message: "must be a list under `roles:`" }]
  );
});

/** The Blocks a Case Study body holds, by name and fields. */
function blocks(body: unknown) {
  const children = (body as { children: { type: string; name?: string; props?: unknown }[] }).children;
  return children
    .filter((node) => node.type === "mdxJsxFlowElement")
    .map(({ name, props }) => ({ name, props }));
}

test("keeps a Case Study's Blocks with their fields", () => {
  const { caseStudies } = content({
    "content/projects/told.mdx": project(
      {},
      '## Screens\n\n<Figure src="/case-studies/told/a.webp" alt="The overview" caption="Monday morning" />\n\n<Callout tone="key" text="Nothing slips." />\n\n<Gallery images={[{ src: "/case-studies/told/b.webp", alt: "Leads" }, { src: "/case-studies/told/c.webp", alt: "Quotes" }]} caption="From lead to quote" />\n'
    ),
  });

  assert.deepEqual(blocks(caseStudies[0].body), [
    { name: "Figure", props: { src: "/case-studies/told/a.webp", alt: "The overview", caption: "Monday morning" } },
    { name: "Callout", props: { tone: "key", text: "Nothing slips." } },
    {
      name: "Gallery",
      props: {
        images: [
          { src: "/case-studies/told/b.webp", alt: "Leads" },
          { src: "/case-studies/told/c.webp", alt: "Quotes" },
        ],
        caption: "From lead to quote",
      },
    },
  ]);
});

test("rejects a Figure without alt text", () => {
  assert.deepEqual(
    errors({ "content/projects/told.mdx": project({}, '<Figure src="/case-studies/told/a.webp" />\n') }),
    [{ file: "content/projects/told.mdx", field: "body", message: "a Figure needs alt text" }]
  );
});

for (const count of [1, 7]) {
  test(`rejects a Gallery of ${count} image(s)`, () => {
    const images = Array.from({ length: count }, (_, i) => `{ src: "/case-studies/told/${i}.webp", alt: "Screen ${i}" }`).join(", ");

    assert.deepEqual(
      errors({ "content/projects/told.mdx": project({}, `<Gallery images={[${images}]} />\n`) }),
      [{ file: "content/projects/told.mdx", field: "body", message: `a Gallery needs 2 to 6 images (has ${count})` }]
    );
  });
}

test("rejects a Gallery image without alt text", () => {
  assert.deepEqual(
    errors({
      "content/projects/told.mdx": project(
        {},
        '<Gallery images={[{ src: "/case-studies/told/a.webp", alt: "A" }, { src: "/case-studies/told/b.webp" }]} />\n'
      ),
    }),
    [{ file: "content/projects/told.mdx", field: "body", message: "every Gallery image needs alt text" }]
  );
});

test("rejects a Case Study it can't read, saying why", () => {
  const found = errors({ "content/projects/told.mdx": project({}, "<Figure src=\n") });

  assert.equal(found.length, 1);
  assert.equal(found[0].field, "body");
  assert.match(found[0].message, /^can't be read: /);
});
