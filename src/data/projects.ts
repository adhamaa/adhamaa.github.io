export type Project = {
  /** Two-digit index shown in the work list. */
  id: string;
  name: string;
  /** One line: what it is, for whom. */
  kicker: string;
  /** The problem it solves. */
  problem: string;
  /** What I built and owned. */
  build: string;
  role: string;
  year: string;
  stack: string[];
  /** Two or three things worth pointing at in an interview. */
  highlights: string[];
  /** Screenshot in /public/screenshots, 1910×872. */
  image?: string;
  imageAlt?: string;
  repo?: string;
  live?: string;
  status: "shipped" | "active" | "archived";
};

export const projects: Project[] = [
  {
    id: "01",
    name: "Sharah CMpro",
    kicker: "Accounting platform with HR built in — an independent product of mine",
    problem:
      "A small manufacturer was running finance and people on separate tools, so the same employee, the same month and the same ringgit had to be entered twice — and reconciled by hand whenever the two disagreed.",
    build:
      "One admin console where production, payroll and the ledger share a single database and permission model: cash in/out, revenue and profit, trial balance, balance sheet, fixed assets and Tax & Zakat on the accounting side; employees, attendance, payroll and owner drawings on the people side. I designed the schema, wrote the API, built every screen, and shipped it to the edge.",
    role: "Solo — schema, API, UI, deploy",
    year: "2026 — present",
    stack: ["Vite", "React", "TypeScript", "Hono", "Cloudflare", "Neon Postgres"],
    highlights: [
      "Real double-entry bookkeeping — trial balance and balance sheet are derived from the same entries staff record daily, not re-keyed",
      "Tax & Zakat handled as first-class modules, because a Malaysian SME needs both and generic accounting tools give you neither",
      "Multi-user with per-entry attribution, so every transaction traces back to whoever recorded it",
      "Serverless Postgres on Neon behind a Hono API on Cloudflare Workers — no servers to patch, cold starts in milliseconds",
    ],
    image: "/screenshots/sharah-cmpro.png",
    imageAlt:
      "Sharah CMpro cash in/out ledger showing monthly totals, an entry form and categorised transactions",
    live: "https://admin.sharah.my/",
    status: "active",
  },
  {
    id: "02",
    name: "Homeopathy Radionic App",
    kicker: "Clinical workspace for homeopathic practitioners",
    problem:
      "Consultations were tracked on paper, which made a patient's history hard to retrieve, hard to compare across visits, and impossible to reason about systematically when deciding on a remedy.",
    build:
      "An app that carries a practitioner from intake to outcome: open a case for a patient, work through the consultation, and produce the resulting remedy set — with repertory and reference material alongside, and the whole history kept queryable for the next visit.",
    role: "Solo — schema, API, UI, deploy",
    year: "2026 — present",
    stack: ["Next.js", "React", "TypeScript", "Hono", "Cloudflare", "Neon Postgres"],
    highlights: [
      "Consultations are drafts that survive interruption — a clinician can stop mid-case, see it waiting on the dashboard, and resume exactly where they left off",
      "Autosaves continuously, so nothing is lost when a session is cut short by the next patient",
      "Bilingual English and Bahasa Melayu throughout, switchable in place",
      "Domain modelled first — patients, cases, findings and remedies as real types rather than loose JSON",
    ],
    image: "/screenshots/homeopathy-radionic-app.png",
    imageAlt:
      "Clinical workspace dashboard with patient search, a consultation draft waiting to be continued, and recent patients",
    live: "https://homeopathy-radionic-app.qahwah.my/",
    status: "active",
  },
  {
    id: "03",
    name: "Quantum Hikmah Certificate Register",
    kicker:
      "Member and certificate management — an Excel system of mine, rebuilt as a web app",
    problem:
      "I originally built this as a spreadsheet during my freelance years — I designed the academy's crest, the certificate template and the issuing logic behind it. It worked, but a spreadsheet cannot be verified by a third party, cannot be shared safely, and needed manual work every time a certificate was reissued.",
    build:
      "The same system rebuilt as a product: members and registrations in one register, certificates generated from those records against selectable templates, previewed as PDF in the browser, and issued singly or in batch. Same logic I designed in Excel, now with a schema, an API and an audit trail behind it.",
    role: "Solo — logic, brand, schema, API, UI, deploy",
    year: "2026 (from a 2020 original)",
    stack: ["Vite", "React", "TypeScript", "Hono", "Cloudflare", "Neon Postgres"],
    highlights: [
      "Carried my own domain logic across a full platform migration — spreadsheet to Postgres — without losing the rules that made the original work",
      "Batch generation: every outstanding certificate for a member rendered in one action, each tied to its registration number",
      "The crest and certificate template are mine too, so generated output matches the academy's identity exactly",
      "Bilingual interface, and role-gated so only admins can issue",
    ],
    image: "/screenshots/qhp-certificate-register.png",
    imageAlt:
      "Certificate register with member selector, template picker, batch generation and an inline PDF preview of a generated certificate",
    live: "https://qhp-web.qahwah.my/",
    status: "active",
  },
  {
    id: "04",
    name: "adhamaa.github.io",
    kicker: "This site",
    problem:
      "A portfolio that loads slowly or says nothing concrete is worse than no portfolio at all.",
    build:
      "A statically exported Next.js build with a typed content layer, dark-first design tokens and a ⌘K command palette. Ships zero client JavaScript on the pages that don't need any.",
    role: "Design + build",
    year: "2026",
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "Radix UI", "GitHub Pages"],
    highlights: [
      "Fully static export — no server, no runtime cost, deployed by GitHub Actions on push",
    ],
    repo: "https://github.com/adhamaa/adhamaa.github.io",
    live: "https://adhamaa.github.io",
    status: "active",
  },
];
