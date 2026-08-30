/**
 * Sample data for the component lab's table. Illustrative, not real — the point
 * of the page is the interaction, not the numbers.
 */

export type Deployment = {
  id: string;
  branch: string;
  env: "production" | "preview";
  status: "ready" | "building" | "error";
  duration: string;
  commit: string;
};

export const deployments: Deployment[] = [
  { id: "dpl_9fa21", branch: "main", env: "production", status: "ready", duration: "48s", commit: "feat: command palette" },
  { id: "dpl_9f8c4", branch: "feat/stack-grid", env: "preview", status: "ready", duration: "41s", commit: "refactor: token colours" },
  { id: "dpl_9f7b0", branch: "fix/marquee", env: "preview", status: "error", duration: "12s", commit: "fix: reduced-motion guard" },
  { id: "dpl_9f6aa", branch: "main", env: "production", status: "ready", duration: "52s", commit: "chore: bump next" },
  { id: "dpl_9f512", branch: "feat/about", env: "preview", status: "building", duration: "—", commit: "wip: about rail" },
  { id: "dpl_9f4d8", branch: "feat/seo", env: "preview", status: "ready", duration: "39s", commit: "feat: metadata + og" },
  { id: "dpl_9f3c1", branch: "main", env: "production", status: "ready", duration: "45s", commit: "feat: dark-first tokens" },
];

/** Column order and headings, left to right. */
export const deploymentColumns = [
  { id: "id", label: "Deployment" },
  { id: "commit", label: "Commit" },
  { id: "branch", label: "Branch" },
  { id: "env", label: "Env" },
  { id: "status", label: "Status" },
  { id: "duration", label: "Duration" },
] as const;

export type DeploymentColumnId = (typeof deploymentColumns)[number]["id"];
