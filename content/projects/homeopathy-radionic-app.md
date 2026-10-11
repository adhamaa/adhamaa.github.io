---
name: Homeopathy Radionic App
order: 3
draft: false
kicker: Clinical workspace for homeopathic practitioners
problem: Consultations were tracked on paper, which made a patient's history hard to retrieve, hard to compare across visits, and impossible to reason about systematically when deciding on a remedy.
build: "An app that carries a practitioner from intake to outcome: open a case for a patient, work through the consultation, and produce the resulting remedy set — with repertory and reference material alongside, and the whole history kept queryable for the next visit."
role: Solo — schema, API, UI, deploy
year: 2026 — present
stack:
  - Next.js
  - React
  - TypeScript
  - Hono
  - Cloudflare
  - Neon Postgres
highlights:
  - Consultations are drafts that survive interruption — a clinician can stop mid-case, see it waiting on the dashboard, and resume exactly where they left off
  - Autosaves continuously, so nothing is lost when a session is cut short by the next patient
  - Bilingual English and Bahasa Melayu throughout, switchable in place
  - Domain modelled first — patients, cases, findings and remedies as real types rather than loose JSON
image: /screenshots/homeopathy-radionic-app.webp
imageAlt: Clinical workspace dashboard with patient search, a consultation draft waiting to be continued, and recent patients
live: https://homeopathy-radionic-app.qahwah.my/
status: active
---
