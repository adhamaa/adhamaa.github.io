import { tinaField } from "tinacms/dist/tina-field";

import type { Project } from "@/data/projects";

/**
 * TinaCMS visual editing, kept to the few places that need it.
 *
 * Visitors get the compiled Content as `data`, and `useTina` hands it straight
 * back. Inside /editor, Tina runs these queries itself and swaps live data in,
 * so pages update as the owner types. Fields the queries select must exist in
 * tina/config.ts.
 */
const projectFields = `
  id
  _sys { filename }
  name
  order
  draft
  caseStudyDraft
  kicker
  problem
  build
  role
  year
  status
  stack
  highlights
  image
  imageAlt
  live
  repo
  body
`;

export const WORK_LIST_QUERY = `query WorkList {
  projectConnection(first: 100) { edges { node { ${projectFields} } } }
}`;

export const CASE_STUDY_QUERY = `query CaseStudy($relativePath: String!) {
  project(relativePath: $relativePath) { ${projectFields} }
}`;

/** A Project as Tina returns it, or as the build provides it before editing. */
export type TinaProject = Partial<Omit<Project, "slug" | "hasCaseStudy">> & {
  _sys: { filename: string };
  order?: number | null;
  draft?: boolean | null;
  caseStudyDraft?: boolean | null;
  /** Rich-text tree from Tina while editing; absent in the build's data. */
  body?: unknown;
  /** Present in the build's data; worked out from `body` while editing. */
  hasCaseStudy?: boolean;
};

export type WorkListData = {
  projectConnection: { edges: { node: TinaProject }[] };
};

export type CaseStudyData = { project: TinaProject };

/** The build's published Projects, in the shape the work-list query returns. */
export function toWorkListData(projects: Project[]): WorkListData {
  return {
    projectConnection: {
      edges: projects.map(({ slug, ...project }, index) => ({
        node: { ...project, _sys: { filename: slug }, order: index },
      })),
    },
  };
}

/** Whether a rich-text tree from Tina has any content. */
function hasBody(body: unknown) {
  const children = (body as { children?: unknown[] } | null | undefined)?.children;
  return Array.isArray(children) && children.length > 0;
}

/**
 * What the work list shows: published Projects in order. The build's data is
 * already that; Tina's live data includes Drafts and needs the same rules the
 * content loader applies.
 */
export function visibleProjects(data: WorkListData): (TinaProject & { slug: string; hasCaseStudy: boolean })[] {
  return data.projectConnection.edges
    .map(({ node }) => node)
    .filter((node) => !node.draft)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a._sys.filename.localeCompare(b._sys.filename))
    .map((node) => ({
      ...node,
      slug: node._sys.filename,
      hasCaseStudy: node.hasCaseStudy ?? (hasBody(node.body) && !node.caseStudyDraft),
    }));
}

/**
 * `data-tina-field` for one field while the page is open in /editor (`edit`),
 * so visitors' pages carry none of Tina's markers.
 */
export function editable(
  edit: boolean,
  object: TinaProject,
  field: keyof TinaProject,
  index?: number
): string | undefined {
  if (!edit) return undefined;
  return tinaField(object as Parameters<typeof tinaField>[0], field as never, index) || undefined;
}
