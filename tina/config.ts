import { defineConfig, type Template, type TinaField } from "tinacms";

import { caseStudyField } from "../src/content/blocks.mts";

/**
 * TinaCMS: the Site's editor, at /admin.
 *
 * Tina edits the same files the build validates (src/content/load.mts), so the
 * build stays the schema; the rules here mirror it so the editor catches a
 * broken one before saving. Visitors never load the editor: pages render the
 * compiled Content, and only /admin swaps in Tina's live data.
 *
 * Locally, `pnpm dev:tina` edits files on disk with no account. The deployed
 * editor signs in through Tina Cloud (NEXT_PUBLIC_TINA_CLIENT_ID, TINA_TOKEN).
 */

/** Opens a document on the page where it appears. */
const home = () => "/";

/** A list of plain strings, one per line in the editor. */
const strings = (name: string, label: string, description?: string): TinaField => ({
  name,
  label,
  type: "string",
  list: true,
  description,
});

const longText = (name: string, label: string, description?: string): TinaField => ({
  name,
  label,
  type: "string",
  description,
  ui: { component: "textarea" },
});

/** A single file the owner edits but never creates or deletes. */
const single = { allowedActions: { create: false, delete: false } } as const;

/**
 * The editor in the Site's brand. Tina 3 colours its interface with fixed
 * Tailwind classes (blue for links and focus, orange for primary buttons), not
 * variables, so the accent is recoloured class by class. Colours only: if an
 * upgrade renames a class, that piece simply falls back to Tina's own colour,
 * and nothing about layout can break.
 */
const green = "hsl(158 72% 30%)"; // --brand in globals.css (light)
const greenDark = "hsl(158 72% 24%)";
const greenBright = "hsl(156 74% 46%)"; // --brand in globals.css (dark)
const greenTint = "hsl(156 60% 95%)";

const recolour = (selectors: string[], declaration: string) =>
  `${selectors.join(",\n")} { ${declaration} !important; }`;

const brand = [
  // Tina's own primary colour: Save, "+", toggles and the active nav.
  recolour([".bg-tina-orange", ".bg-tina-orange-dark"], `background-color: ${green}`),
  recolour(
    [".hover\\:bg-tina-orange:hover", ".hover\\:bg-tina-orange-dark\\/90:hover"],
    `background-color: ${greenDark}`
  ),
  recolour([".bg-tina-orange\\/10"], `background-color: ${greenTint}`),
  recolour(
    [
      ".text-tina-orange", ".text-tina-orange-dark",
      ".hover\\:text-tina-orange:hover", ".hover\\:text-tina-orange-dark:hover",
    ],
    `color: ${green}`
  ),
  recolour(
    [
      ".border-tina-orange", ".border-tina-orange\\/50", ".hover\\:border-tina-orange\\/40:hover",
      ".focus\\:border-tina-orange:focus",
    ],
    `border-color: ${green}`
  ),
  recolour(
    [
      ".focus\\:ring-tina-orange:focus", ".focus\\:ring-tina-orange-dark:focus",
      ".focus-visible\\:ring-tina-orange\\/40:focus-visible", ".ring-tina-orange\\/20",
    ],
    `--tw-ring-color: ${greenBright}`
  ),
  recolour([".fill-tina-orange"], `fill: ${green}`),
  // Tailwind's own blue and orange, used for links, focus and some buttons.
  recolour([".bg-orange-500", ".bg-blue-500"], `background-color: ${green}`),
  recolour(
    [".hover\\:bg-orange-600:hover", ".hover\\:bg-blue-400:hover", ".hover\\:bg-blue-500:hover"],
    `background-color: ${greenDark}`
  ),
  recolour([".bg-blue-50", ".bg-blue-100", ".hover\\:bg-blue-100:hover"], `background-color: ${greenTint}`),
  recolour(
    [
      ".text-blue-400", ".text-blue-500", ".text-blue-600", ".text-blue-700",
      ".text-orange-500", ".text-orange-600",
      ".group:hover .group-hover\\:text-blue-400", ".group:hover .group-hover\\:text-blue-500",
      ".group:hover .group-hover\\:text-blue-600", ".group:hover .group-hover\\:text-orange-500",
      ".hover\\:text-blue-400:hover", ".hover\\:text-blue-500:hover", ".hover\\:text-orange-500:hover",
    ],
    `color: ${green}`
  ),
  recolour(
    [".hover\\:text-blue-600:hover", ".hover\\:text-blue-700:hover", ".hover\\:text-blue-800:hover"],
    `color: ${greenDark}`
  ),
  recolour(
    [
      ".border-blue-400", ".border-blue-500", ".border-blue-600",
      ".focus\\:border-blue-400:focus", ".focus\\:border-blue-500:focus",
      ".focus-within\\:border-blue-500:focus-within",
    ],
    `border-color: ${green}`
  ),
  recolour(
    [".focus\\:ring-blue-500:focus", ".focus\\:ring-orange-500:focus", ".ring-blue-100"],
    `--tw-ring-color: ${greenBright}`
  ),
  `body, input, textarea, button, select { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }`,
  `code, pre, kbd { font-family: "JetBrains Mono", ui-monospace, monospace; }`,
].join("\n");

export default defineConfig({
  branch:
    process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || process.env.HEAD || "master",
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID ?? null,
  token: process.env.TINA_TOKEN ?? null,

  build: { outputFolder: "admin", publicFolder: "public" },
  media: { tina: { mediaRoot: "", publicFolder: "public" } },

  // Load the Site's fonts and brand colours into the editor (see `brand`).
  cmsCallback: (cms) => {
    if (typeof document !== "undefined" && !document.getElementById("site-brand")) {
      const fonts = document.createElement("link");
      fonts.rel = "stylesheet";
      fonts.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
      const style = document.createElement("style");
      style.id = "site-brand";
      style.textContent = brand;
      document.head.append(fonts, style);
    }
    return cms;
  },

  schema: {
    collections: [
      {
        name: "project",
        label: "Projects",
        path: "content/projects",
        format: "mdx",
        ui: {
          // A Project with a published Case Study opens on it; the rest open on
          // the work list, where every card is click-to-edit.
          router: ({ document }) => {
            const doc = document as { body?: { children?: unknown[] }; caseStudyDraft?: boolean };
            return doc.body?.children?.length && !doc.caseStudyDraft
              ? `/work/${document._sys.filename}`
              : home();
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
          longText("problem", "The problem", "The problem it solves."),
          longText("build", "What I built", "What I built and owned."),
          {
            name: "role",
            label: "Role",
            type: "string",
            required: true,
            description: "e.g. Solo — schema, API, UI, deploy",
          },
          { name: "year", label: "Year", type: "string", required: true, description: "e.g. 2026 — present" },
          {
            name: "status",
            label: "Status",
            type: "string",
            required: true,
            options: ["shipped", "active", "archived"],
            description: "Where the product is in its life, not whether it's on the Site.",
          },
          { ...strings("stack", "Stack"), required: true } as TinaField,
          {
            ...strings("highlights", "Highlights", "Two to four things worth pointing at in an interview."),
            required: true,
            ui: {
              validate: (value?: string[]) =>
                value && (value.length < 2 || value.length > 4)
                  ? `Needs 2 to 4 highlights (has ${value.length})`
                  : undefined,
            },
          } as TinaField,
          {
            name: "image",
            label: "Screenshot",
            type: "image",
            description: "1344×614 WebP, from demo data only. The build rejects any other size.",
          },
          {
            name: "imageAlt",
            label: "Screenshot description",
            type: "string",
            description: "What the screenshot shows, for screen readers.",
          },
          { name: "live", label: "Live link", type: "string" },
          { name: "repo", label: "Source link", type: "string" },
          {
            ...caseStudyField,
            description:
              "Optional long-form write-up, read at /work/<slug>. Insert a Figure, Callout or Gallery with +. Images over 500 KB fail the build.",
            templates: caseStudyField.templates as unknown as Template[],
          } as TinaField,
        ],
      },
      {
        name: "profile",
        label: "Profile",
        path: "content",
        format: "yml",
        match: { include: "profile" },
        ui: { ...single, router: home },
        fields: [
          { name: "name", label: "Name", type: "string", isTitle: true, required: true },
          { name: "shortName", label: "Short name", type: "string", required: true },
          { name: "handle", label: "Handle", type: "string", required: true },
          { name: "role", label: "Role", type: "string", required: true },
          { name: "focus", label: "Focus", type: "string", required: true },
          { name: "location", label: "Location", type: "string", required: true },
          { name: "timezone", label: "Time zone", type: "string", required: true },
          { name: "available", label: "Available for work", type: "boolean" },
          { name: "availableLabel", label: "Availability line", type: "string", required: true },
          { name: "email", label: "Email", type: "string", required: true },
          { name: "phone", label: "Phone", type: "string", required: true },
          { name: "siteUrl", label: "Site URL", type: "string", required: true },
          { name: "resumeUrl", label: "Résumé link", type: "string", required: true },
          { name: "coverLetterUrl", label: "Cover letter link", type: "string", required: true },
          longText("tagline", "Tagline", "Keep any platform count in step with your Projects."),
          {
            name: "stats",
            label: "Stats",
            type: "object",
            list: true,
            description: "Three facts above the fold. Keep the platform count in step with your Projects.",
            ui: { itemProps: (item: { value?: string; label?: string }) => ({ label: `${item?.value ?? ""} — ${item?.label ?? ""}` }) },
            fields: [
              { name: "value", label: "Value", type: "string", required: true },
              { name: "label", label: "Label", type: "string", required: true },
            ],
          },
          strings("bio", "Bio", "One paragraph per item. Keep the platform count in step with your Projects."),
          strings("capabilities", "What I can take on"),
          strings("now", "Now"),
          {
            name: "principles",
            label: "Principles",
            type: "object",
            list: true,
            ui: { itemProps: (item: { title?: string }) => ({ label: item?.title }) },
            fields: [
              { name: "title", label: "Title", type: "string", required: true },
              longText("body", "Body"),
            ],
          },
        ],
      },
      {
        name: "roles",
        label: "Roles",
        path: "content",
        format: "yml",
        match: { include: "roles" },
        ui: { ...single, router: home },
        fields: [
          {
            name: "roles",
            label: "Roles",
            type: "object",
            list: true,
            description: "Most relevant first. Drag to reorder.",
            ui: {
              itemProps: (item: { title?: string; company?: string }) => ({
                label: `${item?.title ?? "New Role"} · ${item?.company ?? ""}`,
              }),
            },
            fields: [
              { name: "title", label: "Title", type: "string", required: true },
              { name: "company", label: "Company", type: "string", required: true },
              { name: "location", label: "Location", type: "string", required: true },
              { name: "period", label: "Period", type: "string", required: true, description: "e.g. Sep 2026 — present" },
              longText("summary", "Summary", "One line on what the job actually was."),
              strings("points", "Points"),
              strings("stack", "Stack"),
              { name: "current", label: "Current", type: "boolean" },
            ],
          },
        ],
      },
      {
        name: "stack",
        label: "Stack Groups",
        path: "content",
        format: "yml",
        match: { include: "stack" },
        ui: { ...single, router: home },
        fields: [
          {
            name: "groups",
            label: "Stack Groups",
            type: "object",
            list: true,
            description: "In display order. Drag to reorder.",
            ui: { itemProps: (item: { title?: string }) => ({ label: item?.title }) },
            fields: [
              { name: "title", label: "Title", type: "string", required: true },
              { name: "note", label: "Note", type: "string", required: true },
              strings("items", "Tools"),
            ],
          },
        ],
      },
    ],
  },
});
