/**
 * Single source of truth for everything personal on this site.
 * Edit this file first — the pages read from it.
 */

export const profile = {
  name: "Adham Akmal Azmi",
  shortName: "Adham AA",
  handle: "adhamaa",
  role: "Full-Stack Engineer",
  focus: "React · Next.js · Hono · Node.js · Python",
  location: "Pahang, Malaysia",
  timezone: "GMT+8",
  available: true,
  availableLabel: "Available now — full-time or contract",
  email: "adham_92@live.com",
  phone: "+60 12-298 7734",
  siteUrl: "https://adhamaa.github.io",
  resumeUrl: "/Adham_Akmal_Azmi_Resume.pdf",
  coverLetterUrl: "/Adham_Akmal_Azmi_Cover_Letter.pdf",

  tagline:
    "I ship business software end to end — the interface, the API behind it, and the edge infrastructure it runs on. Three production platforms, all built solo.",

  /** Three facts, above the fold, that answer \"why you\". */
  stats: [
    { value: "5+", label: "Years shipping production software" },
    { value: "3", label: "Platforms built solo, schema to deploy" },
    { value: "2022–26", label: "Led frontend at Shinkels Technik" },
  ],

  bio: [
    "I'm a full-stack engineer based in Malaysia, five years into building software that companies actually run on. Three of those systems are my own products — an accounting and HR platform, a clinic case-management app and a certificate registry — all live, all built by me from the schema up to the last piece of UI.",
    "The through-line is ownership. I'm comfortable designing a Postgres schema in the morning, writing the Hono API against it at lunch, and shipping the React screens that consume it before the day is out — then owning the deploy, the bugs, and the next iteration. For four years I led frontend architecture at Shinkels Technik, wrote REST and GraphQL services in Node and Python, and reviewed the team's code; that role closed in August 2026 and I'm looking for the next one.",
  ],

  /** What a client or hiring manager can hand me on day one. */
  capabilities: [
    "Internal tools, admin consoles and dashboards",
    "Business platforms — accounting, HR, operations, CRM",
    "REST & GraphQL API design, auth and role-based access",
    "Edge deployment: Cloudflare Workers, serverless Postgres",
    "Design-system frontends in React, Next.js and TypeScript",
    "AI-assisted delivery — faster drafts, reviewed and hardened by hand",
    "Taking an ambiguous brief to a shipped v1, solo",
  ],

  now: [
    "Building on the edge — Hono on Cloudflare Workers with Neon Postgres.",
    "Deepening Python API work: Flask services and data pipelines.",
    "Contributing to open source, especially Islamic open source projects.",
  ],

  principles: [
    {
      title: "I own the whole slice",
      body: "Schema, API, interface, deploy. Nothing gets thrown over a wall, and nothing waits on someone else's half of the feature.",
    },
    {
      title: "AI is a tool, not an author",
      body: "I pair with AI daily — it makes the first draft fast. Nothing ships unread: I review every line, refactor it to the standard the codebase already holds, and optimise what it got lazily right.",
    },
    {
      title: "Ship small, ship often",
      body: "Short-lived branches, reversible changes, and a deploy pipeline boring enough to trust on a Friday afternoon.",
    },
    {
      title: "Types are documentation",
      body: "If the compiler can catch it, a reviewer shouldn't have to. Model the domain first, wire the UI second.",
    },
    {
      title: "Built for the person using it",
      body: "Accounting clerks and clinicians don't read release notes. Semantic HTML, real focus states, fast pages on mid-range hardware.",
    },
    {
      title: "Measure before optimising",
      body: "Bundle budgets, real device timings and a profiler beat opinions about what feels slow.",
    },
  ],
} as const;

export type SocialLink = {
  name: string;
  handle: string;
  href: string;
  icon: "github" | "linkedin" | "x" | "instagram" | "mail";
};

export const socials: SocialLink[] = [
  {
    name: "GitHub",
    handle: "@adhamaa",
    href: "https://github.com/adhamaa",
    icon: "github",
  },
  {
    name: "LinkedIn",
    handle: "adham-akmal-azmi",
    href: "https://www.linkedin.com/in/adham-akmal-azmi-421a7b134/",
    icon: "linkedin",
  },
  {
    name: "X",
    handle: "@adhamakmal",
    href: "https://twitter.com/adhamakmal",
    icon: "x",
  },
  {
    name: "Email",
    handle: profile.email,
    href: `mailto:${profile.email}`,
    icon: "mail",
  },
];

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Lab", href: "/table" },
] as const;

/** In-page anchors offered by the command palette. */
export const sectionLinks = [
  { label: "Selected work", href: "/#work" },
  { label: "Experience", href: "/#experience" },
  { label: "Stack", href: "/#stack" },
  { label: "How I work", href: "/#approach" },
  { label: "Contact", href: "/#contact" },
] as const;
