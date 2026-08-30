/**
 * The open cover letter, in the same typed-content spirit as `profile.ts`:
 * the page and the print source in `resume/` both render this, so the letter
 * exists in one place and nowhere else.
 *
 * It is deliberately addressed to no one. `openingFor` is the single clause a
 * targeted version swaps out — everything after it is evidence that holds
 * regardless of who is reading.
 */

export const coverLetter = {
  /** Fixed rather than `new Date()`: a static export would otherwise re-date itself on every deploy. */
  dated: "August 2026",
  greeting: "Dear Hiring Manager,",

  /** Swap this line, and the rest of the letter still stands. */
  openingFor:
    "I'm writing about your full-stack engineering role — and because I'd rather be judged on what I've shipped than on what I claim, here is the concrete version.",

  paragraphs: [
    "I'm a full-stack engineer based in Malaysia, five years into building software that companies actually run on. For the last four of them I led frontend architecture at Shinkels Technik and wrote the services behind it — Node.js and Express REST and GraphQL endpoints, Python Flask APIs where the Python ecosystem was the better fit, authentication and role-based access across both. That role closed in August 2026, which is why I'm writing.",

    "Alongside it I designed, built and shipped three products of my own, each one solo and each one live today. Sharah CMpro is an accounting platform with HR built in, where production, payroll and a real double-entry ledger share one database and one permission model — trial balance and balance sheet are derived from the entries staff record daily, not re-keyed. The Homeopathy Radionic App takes a practitioner from patient intake to remedy through resumable, autosaving consultations that survive being interrupted by the next patient. The Quantum Hikmah Certificate Register began as a spreadsheet I built years earlier and became a Postgres-backed registry with templated, batch certificate issuing. For all three I owned the schema, the API, every screen and the deployment.",

    "That end-to-end habit is the thing I'd bring you. I'm comfortable designing a Postgres schema in the morning, writing the Hono API against it at lunch, and shipping the React screens that consume it before the day is out — then owning the deploy, the bugs and the next iteration. Nothing gets thrown over a wall, and nothing waits on someone else's half of the feature.",

    "I'm equally at home inside a team: I set coding standards, ran code reviews and mentored junior developers at Shinkels. I pair with AI daily and treat it as a tool rather than an author — it makes the first draft fast, and nothing ships unread. I review every line, refactor it to the standard the codebase already holds, and optimise what it got lazily right.",

    "What I'm looking for is a team that ships to real users and cares how the thing is built underneath. If that's the role you're filling, I'd welcome the conversation — and I'm happy to walk you through any of the three systems above, code included.",
  ],

  signOff: "Sincerely,",

  /** Framing for the web version only; the PDF is the letter alone. */
  note: "This is an open letter rather than one aimed at a particular posting. Tell me the role and I'll send you the version written for it.",
} as const;
