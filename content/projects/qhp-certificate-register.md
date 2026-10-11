---
name: Quantum Hikmah Certificate Register
order: 4
draft: false
kicker: Member and certificate management — an Excel system of mine, rebuilt as a web app
problem: I originally built this as a spreadsheet during my freelance years — I designed the academy's crest, the certificate template and the issuing logic behind it. It worked, but a spreadsheet cannot be verified by a third party, cannot be shared safely, and needed manual work every time a certificate was reissued.
build: "The same system rebuilt as a product: members and registrations in one register, certificates generated from those records against selectable templates, previewed as PDF in the browser, and issued singly or in batch. Same logic I designed in Excel, now with a schema, an API and an audit trail behind it."
role: Solo — logic, brand, schema, API, UI, deploy
year: 2026 (from a 2020 original)
stack:
  - Vite
  - React
  - TypeScript
  - Hono
  - Cloudflare
  - Neon Postgres
highlights:
  - Carried my own domain logic across a full platform migration — spreadsheet to Postgres — without losing the rules that made the original work
  - "Batch generation: every outstanding certificate for a member rendered in one action, each tied to its registration number"
  - The crest and certificate template are mine too, so generated output matches the academy's identity exactly
  - Bilingual interface, and role-gated so only admins can issue
image: /screenshots/qhp-certificate-register.webp
imageAlt: Certificate register with member selector, template picker, batch generation and an inline PDF preview of a generated certificate
live: https://qhp-web.qahwah.my/
status: active
---
