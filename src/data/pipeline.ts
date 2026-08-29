/**
 * The four layers of a single feature, pinned and scrubbed on the home page.
 *
 * This is `profile.principles[0]` — "I own the whole slice" — pulled apart into
 * the order the work actually happens in. The copy is drawn from `profile.bio`
 * and the stack groups; keep it that way so the claim and the proof agree.
 */

export type PipelineLayer = {
  /** Two-digit index, matching the numbering used elsewhere on the site. */
  id: string;
  /** The layer, in one word. */
  title: string;
  /** The beat of the day it happens on. */
  kicker: string;
  body: string;
  /** Four at most — these render as chips inside the layer slab. */
  items: string[];
};

export const pipeline: PipelineLayer[] = [
  {
    id: "01",
    title: "Schema",
    kicker: "designed in the morning",
    body: "Model the domain first, wire the UI second. A Postgres schema exists before a line of interface does, because if the database and the compiler can catch it, a reviewer should not have to.",
    items: ["PostgreSQL", "Neon", "Zod", "SQL"],
  },
  {
    id: "02",
    title: "API",
    kicker: "written against it at lunch",
    body: "REST and GraphQL services typed end to end against the schema above, with auth and role-based access designed in rather than bolted on afterwards.",
    items: ["Hono", "Node.js", "GraphQL", "Flask"],
  },
  {
    id: "03",
    title: "Interface",
    kicker: "shipped before the day is out",
    body: "Design-system frontends in React and TypeScript. Semantic HTML and real focus states, fast on the mid-range hardware the people using it actually have.",
    items: ["TypeScript", "React", "Next.js", "Tailwind"],
  },
  {
    id: "04",
    title: "Deploy",
    kicker: "then the bugs, then the next one",
    body: "Edge deployment on Cloudflare Workers with serverless Postgres, on a pipeline boring enough to trust on a Friday afternoon. Nothing gets thrown over a wall.",
    items: ["Cloudflare Workers", "Docker", "GitHub Actions", "PM2"],
  },
];
