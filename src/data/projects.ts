import type { Project } from "@/content/load.mts";
import projectsJson from "./generated/projects.json";

export type { Project };

/**
 * Published Projects, in the order the owner set. Compiled from
 * `content/projects/` — edit them there, or at /admin.
 */
export const projects = projectsJson as Project[];
