import { defineConfig } from "tinacms";

/**
 * TinaCMS: visual editing for the Site's Content (trial).
 *
 * Tina edits the same files the build validates (src/content/load.mts), so the
 * build stays the schema; the rules here mirror it so the editor catches a
 * broken one before saving. Visitors never load Tina: pages render the compiled
 * Content, and only /editor swaps in Tina's live data.
 *
 * Locally, `pnpm dev:tina` edits files on disk with no account. Tina Cloud
 * (NEXT_PUBLIC_TINA_CLIENT_ID and TINA_TOKEN) is only needed to edit the live
 * Site.
 */
export default defineConfig({
  branch: process.env.GITHUB_BRANCH ?? "master",
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? null,
  token: process.env.TINA_TOKEN ?? null,

  // /editor during the trial, so the Sveltia editor at /admin keeps working.
  build: { outputFolder: "editor", publicFolder: "public" },
  media: { tina: { mediaRoot: "", publicFolder: "public" } },

  schema: {
    collections: [
      {
        name: "project",
        label: "Projects",
        path: "content/projects",
        format: "md",
        ui: {
          // Open a Project on its Case Study when one is published, else on the
          // work list. Draft Case Studies have no page yet, so they're edited
          // in the form beside the work list.
          router: ({ document }) => {
            const doc = document as { body?: { children?: unknown[] }; caseStudyDraft?: boolean };
            return doc.body?.children?.length && !doc.caseStudyDraft
              ? `/work/${document._sys.filename}`
              : "/";
          },
          filename: {
            // The Slug: the Case Study's address, set once at creation.
            readonly: true,
            slugify: (values) =>
              String(values?.name ?? "")
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, ""),
          },
        },
        fields: [
          { name: "name", label: "Name", type: "string", isTitle: true, required: true },
          {
            name: "order",
            label: "Position",
            type: "number",
            required: true,
            description: "Where it sits in the work list. Lowest first.",
          },
          {
            name: "draft",
            label: "Draft",
            type: "boolean",
            description: "Saved but not shown anywhere on the Site. Separate from Status.",
          },
          {
            name: "caseStudyDraft",
            label: "Case Study is a Draft",
            type: "boolean",
            description: "Keeps the Case Study off the Site while you finish it.",
          },
          {
            name: "kicker",
            label: "Kicker",
            type: "string",
            required: true,
            description: "One line: what it is, for whom.",
          },
          {
            name: "problem",
            label: "The problem",
            type: "string",
            required: true,
            ui: { component: "textarea" },
          },
          {
            name: "build",
            label: "What I built",
            type: "string",
            required: true,
            ui: { component: "textarea" },
          },
          { name: "role", label: "Role", type: "string", required: true },
          { name: "year", label: "Year", type: "string", required: true },
          {
            name: "status",
            label: "Status",
            type: "string",
            required: true,
            options: ["shipped", "active", "archived"],
            description: "Where the product is in its life, not whether it's on the Site.",
          },
          { name: "stack", label: "Stack", type: "string", list: true, required: true },
          {
            name: "highlights",
            label: "Highlights",
            type: "string",
            list: true,
            required: true,
            description: "Two to four things worth pointing at in an interview.",
            ui: {
              validate: (value?: string[]) =>
                value && (value.length < 2 || value.length > 4)
                  ? `Needs 2 to 4 highlights (has ${value.length})`
                  : undefined,
            },
          },
          {
            name: "image",
            label: "Screenshot",
            type: "image",
            description: "1344×614 WebP, from demo data only. The build rejects any other size.",
          },
          { name: "imageAlt", label: "Screenshot description", type: "string" },
          { name: "live", label: "Live link", type: "string" },
          { name: "repo", label: "Source link", type: "string" },
          {
            name: "body",
            label: "Case Study",
            type: "rich-text",
            isBody: true,
          },
        ],
      },
    ],
  },
});
