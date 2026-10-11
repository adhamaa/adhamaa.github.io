import type { StackGroup } from "@/content/load.mts";
import stackJson from "./generated/stack.json";

export type { StackGroup };

/** Stack Groups, in display order. Compiled from `content/stack.yml`. */
export const stack: StackGroup[] = stackJson;

/** Rendered in the hero ticker. */
export const marqueeItems = [
  "TypeScript",
  "React",
  "Next.js",
  "Hono",
  "Node.js",
  "Express",
  "GraphQL",
  "Python",
  "Flask",
  "PostgreSQL",
  "Neon",
  "Cloudflare Workers",
  "Docker",
  "Tailwind CSS",
];
