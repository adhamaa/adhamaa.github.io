---
name: AA Digital Works
order: 1
draft: false
caseStudyDraft: false
kicker: The platform my own web business runs on — leads to invoices, plus the landing site that feeds it
problem: A one-person web business lives or dies on follow-up. Leads arrived over WhatsApp and a contact form, quotes were documents, and projects and invoices were tracked somewhere else again — so nothing showed where a client actually stood.
build: "One system with a public side and an admin side. A bilingual landing site captures leads; the back office carries each one through quote, project and invoice, with tasks, time and support plans along the way. Three apps in one monorepo: a Hono API on Cloudflare Workers, a React admin for the owner and staff, and an Astro landing site in Bahasa Melayu and English — sharing one Neon Postgres database through Drizzle."
role: Solo — schema, API, UI, deploy
year: 2026 — present
stack:
  - Hono
  - Cloudflare Workers
  - Drizzle
  - Neon Postgres
  - React
  - Vite
  - TanStack Query
  - Astro
  - Clerk
  - Novu
highlights:
  - One flow from lead to quote to project to invoice, so a client's whole history sits on one record
  - Client status links let a client follow their project's progress without an account
  - The bilingual Bahasa Melayu and English landing site feeds leads straight into the back office
  - Notification workflows keep the owner and staff on top of what changed, by e-mail and in-app
image: /screenshots/aa-digital-works.webp
imageAlt: AA Digital Works overview with money outstanding and overdue invoices, the sales pipeline with new leads, and delivery and support plan cards — shown with demo data
live: https://aa.digitalworks.com.my/
status: active
---
## The problem

AA Digital Works is my own business: one developer building websites, landing pages, and management, booking and inventory systems for Malaysian shops, service businesses and institutions. Clients find me on a landing page, then the conversation moves to WhatsApp, a quote goes out as a document, work starts, and an invoice follows weeks later.

Spread across chat threads, documents and a spreadsheet, that chain leaks. A lead waits a day too long for a reply. A quote is accepted but the deposit invoice never goes out. A client messages to ask how far along their site is, because nothing tells them. With one person doing the selling, the building and the bookkeeping, the system has to hold the follow-ups so I don't have to.

The test I set: no lead is missed, I always know what is due, what is owed and where every project stands, and a client never has to ask "how far along is it?"

## What I built

One platform with a public side and an admin side, in a single TypeScript monorepo:

- **A landing site** in Astro, Malay first with English alongside, which turns visitors into leads. The form posts to the API, which e-mails me and drops the lead into the admin.
- **An API** in Hono on Cloudflare Workers, over Neon Postgres through Drizzle. It owns every business rule and checks every permission.
- **An admin** in React, installable as an app on my phone, because that is where I usually am when a lead comes in or a payment lands.

Inside the admin, a lead becomes a quote, an accepted quote becomes a project, and the project moves through the same three steps the landing page promises clients: *Bina, Lancarkan, Kembangkan* (build, launch, grow). Each project carries milestones the client would recognise, internal tasks, and time logged in minutes. Support work runs under monthly plans with included hours, and the system warns me at 80% and 100% of a client's plan.

Invoices are numbered when issued and never change after that. A mistake is voided and reissued under a new number, and payments are recorded against them, so the ledger always adds up. Each invoice renders to PDF and goes out by e-mail from the admin.

Clients get a **status link**: a read-only page for one project showing its stage, due date and finished milestones. No login, no prices, no client name, and I can revoke it at any time.

The home screen is a single morning view: money outstanding and overdue, quotes awaiting a reply, follow-ups due, late milestones and support plans near their limit. Every morning a scheduled job sends reminders for anything that has slipped.

## Decisions worth explaining

**The API enforces roles; the admin only hides.** Owner, admin and staff each see a different slice: staff see their own tasks and time and never money or clients. One policy module decides which rows and fields each role can reach, and it fails closed: a resource without a policy is refused for everyone. The admin reads its buttons from what the API says is allowed, rather than checking role names itself.

**Money rules live in one place.** Every invoice transition goes through a single ledger module: issuing, numbering, payments, the paid flag, voiding and reissuing. It answers with an outcome or a named refusal, and knows nothing about HTTP or roles, so the rules can be tested directly and can't drift between screens.

**An append-only audit trail.** Every change records who made it, what changed (before and after), whether it was allowed, and which request it came from. The same request id appears in the logs and in the admin's error messages, so "something broke" traces back to the exact request.

**PDFs without a paid plan.** Generating a PDF in JavaScript cost 150–430 ms of CPU per page, far over the Workers free tier's 10 ms. So the invoice is rendered as HTML and printed to PDF by Cloudflare's browser rendering, whose waiting time doesn't count as CPU. A print stylesheet on the same page is the fallback.

**AI assistants as a first-class way in.** The platform exposes an MCP endpoint, so Claude or ChatGPT can work in it as me, signed in through the same login and limited to the same role. Every assistant action goes through the existing API routes, so the policy and the audit trail apply unchanged. Anything irreversible — issuing an invoice, recording a payment, sending e-mail — stays with a person in the admin.

## Where it stands

The first version was built in the first week of October 2026 and runs in production. It is a new business, so there are no client numbers to report yet. What I can show is the system itself, and the screenshot on this Project uses demo data, never a client's.

Next on the list are quote PDFs in both languages, a users screen, and porting the rest of the landing page's sales copy.
