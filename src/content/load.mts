/**
 * Reads the Site's Content from disk and returns it validated and typed, or a
 * list of plain-language errors naming the file and field at fault.
 *
 * This is the one place Content is checked. The build runs it before Next does,
 * so an edit that breaks a rule here fails `verify` and never deploys. It only
 * imports packages and Node built-ins, so Node can run it (and its tests)
 * directly, without the bundler.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import { z } from "zod";
import { parse as parseYaml } from "yaml";
import { parseMDX } from "@tinacms/mdx";

import { caseStudyField } from "./blocks.mts";

/** Must match the slug pattern in the editor's configuration. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const text = z.string().trim().min(1, "can't be empty");
const texts = z.array(text);

/** An optional field left empty in the editor arrives as null or "": absent. */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === null || value === "" ? undefined : value), schema.optional());

const profileSchema = z.object({
  name: text,
  shortName: text,
  handle: text,
  role: text,
  focus: text,
  location: text,
  timezone: text,
  available: z.boolean(),
  availableLabel: text,
  email: z.email(),
  phone: text,
  siteUrl: z.url(),
  resumeUrl: text,
  coverLetterUrl: text,
  tagline: text,
  stats: z.array(z.object({ value: text, label: text })),
  bio: texts,
  capabilities: texts,
  now: texts,
  principles: z.array(z.object({ title: text, body: text })),
});

const roleSchema = z.object({
  title: text,
  company: text,
  location: text,
  period: text,
  summary: text,
  points: texts,
  stack: texts,
  current: optional(z.boolean()),
});

const stackGroupSchema = z.object({
  title: text,
  note: text,
  items: texts,
});

const projectSchema = z.object({
  name: text,
  order: z.number(),
  /** Saved but not shown on the Site. Independent of `status`. */
  draft: z.boolean().default(false),
  /** Keeps a written Case Study off the Site while it's being finished. */
  caseStudyDraft: z.boolean().default(false),
  kicker: text,
  problem: text,
  build: text,
  role: text,
  year: text,
  status: z.enum(["shipped", "active", "archived"], {
    error: "must be shipped, active or archived",
  }),
  stack: texts.min(1, "needs at least one tool"),
  highlights: texts.check((ctx) => {
    if (ctx.value.length < 2 || ctx.value.length > 4) {
      ctx.issues.push({
        code: "custom",
        input: ctx.value,
        message: `needs 2 to 4 highlights (has ${ctx.value.length})`,
      });
    }
  }),
  image: optional(text),
  imageAlt: optional(text),
  repo: optional(z.url()),
  live: optional(text),
});

export type Profile = z.infer<typeof profileSchema>;
export type Role = z.infer<typeof roleSchema>;
export type StackGroup = z.infer<typeof stackGroupSchema>;
export type Project = Omit<
  z.infer<typeof projectSchema>,
  "order" | "draft" | "caseStudyDraft"
> & {
  /** The file name, set once when the Project is created and never changed. */
  slug: string;
  /** Whether a published Case Study exists for this Project. */
  hasCaseStudy: boolean;
};

/** A Project's long-form write-up, rendered to HTML. */
/** A Case Study's write-up as the tree TinaCMS edits and the Site renders. */
export type RichText = { type: "root"; children: unknown[] };

/** A Project's long-form write-up, ready to render. */
export type CaseStudy = { slug: string; body: RichText };

export type Content = {
  profile: Profile;
  roles: Role[];
  stackGroups: StackGroup[];
  /** Published Projects, in the order the owner set. */
  projects: Project[];
  /** Published Case Studies, one per Project at most. */
  caseStudies: CaseStudy[];
};

export type ContentError = { file: string; field: string; message: string };

export type LoadResult =
  | { ok: true; content: Content }
  | { ok: false; errors: ContentError[] };

export function loadContent(root: string): LoadResult {
  const errors: ContentError[] = [];
  const contentDir = join(root, "content");
  const fileOf = (path: string) => relative(root, path).split("\\").join("/");

  /** Parses one value against a schema, recording any issues against `file`. */
  function check<T>(schema: z.ZodType<T>, value: unknown, file: string): T | null {
    const result = schema.safeParse(value);
    if (result.success) return result.data;
    for (const issue of result.error.issues) {
      errors.push({ file, field: issue.path.join(".") || "(file)", message: issue.message });
    }
    return null;
  }

  function readYaml(name: string): { file: string; value: unknown } {
    const path = join(contentDir, name);
    const file = fileOf(path);
    try {
      return { file, value: parseYaml(readFileSync(path, "utf8")) };
    } catch (error) {
      errors.push({ file, field: "(file)", message: describe(error) });
      return { file, value: undefined };
    }
  }

  const profileFile = readYaml("profile.yml");
  const profile = check(profileSchema, profileFile.value, profileFile.file);

  /**
   * Reads a file holding one list under `key`. The editor can't edit a file
   * whose top level is a bare list, so that older shape gets its own message.
   */
  function readList<T>(name: string, key: string, item: z.ZodType<T>): T[] | null {
    const { file, value } = readYaml(name);
    if (Array.isArray(value)) {
      errors.push({ file, field: key, message: `must be a list under \`${key}:\`` });
      return null;
    }
    const parsed = check(z.object({ [key]: z.array(item) }), value, file);
    return parsed ? (parsed[key] as T[]) : null;
  }

  const roles = readList("roles.yml", "roles", roleSchema);
  const stackGroups = readList("stack.yml", "groups", stackGroupSchema);

  const projectsDir = join(contentDir, "projects");
  const loaded: (z.infer<typeof projectSchema> & { slug: string; body: RichText | null })[] = [];

  const projectFiles = existsSync(projectsDir) ? readdirSync(projectsDir) : [];
  for (const name of projectFiles.filter((n) => extname(n) === ".mdx").sort()) {
    const path = join(projectsDir, name);
    const file = fileOf(path);
    const { data, body } = splitFrontMatter(readFileSync(path, "utf8"), file, errors);
    // Unreadable front matter is already reported; checking it again adds noise.
    const fields = data === undefined ? null : check(projectSchema, data, file);
    const slug = basename(name, ".mdx");
    if (!SLUG.test(slug)) {
      errors.push({
        file,
        field: "slug",
        message: "must be lowercase letters, digits and hyphens, like my-project",
      });
    }
    if (fields?.image) {
      const problem = checkScreenshot(join(root, "public", fields.image), fields.image);
      if (problem) errors.push({ file, field: "image", message: problem });
    }
    const tree = readCaseStudy(body, file, errors);
    if (fields) loaded.push({ ...fields, slug, body: tree });
  }

  // Case Study images live in a folder per Project. Anything the editor
  // uploads there is checked, whether or not the write-up uses it yet.
  const imagesDir = join(root, "public", "case-studies");
  if (existsSync(imagesDir)) {
    for (const entry of readdirSync(imagesDir, { recursive: true, encoding: "utf8" })) {
      const path = join(imagesDir, entry);
      const stats = statSync(path);
      if (stats.isFile() && stats.size > CASE_STUDY_IMAGE_LIMIT) {
        errors.push({
          file: fileOf(path),
          field: "size",
          message: `is ${Math.round(stats.size / 1024)} KB; Case Study images must be 500 KB or smaller`,
        });
      }
    }
  }

  if (errors.length > 0 || !profile || !roles || !stackGroups) {
    return { ok: false, errors };
  }

  const published = loaded
    .filter((p) => !p.draft)
    .sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));

  const caseStudies: CaseStudy[] = published
    .filter((p) => p.body && !p.caseStudyDraft)
    .map((p) => ({ slug: p.slug, body: p.body as RichText }));

  const projects: Project[] = published.map(
    ({ order: _o, draft: _d, caseStudyDraft: _c, body: _b, ...fields }) => ({
      ...fields,
      hasCaseStudy: caseStudies.some((c) => c.slug === fields.slug),
    })
  );

  return { ok: true, content: { profile, roles, stackGroups, projects, caseStudies } };
}

/** Keeps a camera-roll photo from slowing a Case Study page down. */
const CASE_STUDY_IMAGE_LIMIT = 500 * 1024;

/** Every Project screenshot renders in the same frame, so all share one size. */
const SCREENSHOT = { width: 1344, height: 614 };

/** Returns what's wrong with a screenshot, or null if it fits the frame. */
function checkScreenshot(path: string, publicPath: string): string | null {
  let bytes: Buffer;
  try {
    bytes = readFileSync(path);
  } catch {
    return `points to ${publicPath}, which isn't in public/`;
  }
  const size = webpSize(bytes);
  if (!size) return "must be a WebP image";
  if (size.width !== SCREENSHOT.width || size.height !== SCREENSHOT.height) {
    return `must be ${SCREENSHOT.width}×${SCREENSHOT.height} (is ${size.width}×${size.height})`;
  }
  return null;
}

/** Reads a WebP's pixel size from its header, or null if it isn't a WebP. */
function webpSize(bytes: Buffer): { width: number; height: number } | null {
  if (
    bytes.length < 30 ||
    bytes.toString("ascii", 0, 4) !== "RIFF" ||
    bytes.toString("ascii", 8, 12) !== "WEBP"
  ) {
    return null;
  }
  switch (bytes.toString("ascii", 12, 16)) {
    case "VP8X":
      return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
    case "VP8 ":
      return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
    case "VP8L": {
      const bits = bytes.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    default:
      return null;
  }
}

/** How many images a Gallery holds: enough to show a flow, few enough to read. */
const GALLERY = { min: 2, max: 6 };

type Node = { type?: string; name?: string; props?: Record<string, unknown>; message?: string; children?: Node[] };

/**
 * Parses a Case Study's MDX into the tree TinaCMS edits, and checks its Blocks.
 * An empty body means no Case Study.
 */
function readCaseStudy(body: string, file: string, errors: ContentError[]): RichText | null {
  if (!body.trim()) return null;
  const tree = parseMDX(body, caseStudyField as never, (src: string) => src) as unknown as RichText;

  const problems: string[] = [];
  const visit = (node: Node) => {
    if (node.type === "invalid_markdown") {
      problems.push(`can't be read: ${String(node.message ?? "invalid MDX").split("\n")[0]}`);
    } else if (node.type === "mdxJsxFlowElement" && node.name === "Figure") {
      if (!String(node.props?.alt ?? "").trim()) problems.push("a Figure needs alt text");
      if (!String(node.props?.src ?? "").trim()) problems.push("a Figure needs an image");
    } else if (node.type === "mdxJsxFlowElement" && node.name === "Gallery") {
      const images = Array.isArray(node.props?.images) ? (node.props?.images as Node["props"][]) : [];
      if (images.length < GALLERY.min || images.length > GALLERY.max) {
        problems.push(`a Gallery needs ${GALLERY.min} to ${GALLERY.max} images (has ${images.length})`);
      }
      if (images.some((image) => !String(image?.alt ?? "").trim())) {
        problems.push("every Gallery image needs alt text");
      }
    }
    node.children?.forEach(visit);
  };
  (tree.children as Node[]).forEach(visit);

  for (const message of problems) errors.push({ file, field: "body", message });
  return tree;
}

/** Splits a Markdown file into its YAML front matter and its body. */
function splitFrontMatter(
  source: string,
  file: string,
  errors: ContentError[]
): { data: unknown; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(source);
  if (!match) {
    errors.push({ file, field: "(file)", message: "must start with front matter between --- lines" });
    return { data: undefined, body: "" };
  }
  try {
    return { data: parseYaml(match[1]), body: match[2] };
  } catch (error) {
    errors.push({ file, field: "(front matter)", message: describe(error) });
    return { data: undefined, body: "" };
  }
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message.split("\n")[0] : String(error);
}
