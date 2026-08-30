# Tailwind v4, and the browser floor that comes with it

We upgraded from Tailwind 3.3.3 to v4, which raises this site's minimum Firefox from 111 to **128** (Chrome 111 and Safari 16.4 are unchanged, matching Next 16's own floor). This was a choice rather than a consequence of upgrading Next: Next 16 ships a documented, supported Tailwind v3 path explicitly for projects wanting broader browser support, so staying on v3 was a legitimate end state and not technical debt.

We took v4 anyway because Firefox auto-updates and 128 shipped in mid-2024, making the real-world cost close to zero for a developer-audience portfolio — and because it keeps `tailwind-merge` (v3+ is v4-only) and the shadcn CLI's modern output on the same side of the version line, rather than betting on unverified v3 compatibility for React Aria components.

## Consequences

- **`tailwind-merge` must stay on 3.x.** It has no peer dependency on Tailwind, so a v1 `cn()` would silently mis-merge conflicting classes against v4 with nothing to catch it.
- **`tailwindcss-animate` is replaced by `tw-animate-css`.**
- **`tailwind.config.ts` is gone**, its container, font, colour and seven keyframe/animation definitions ported to CSS-first `@theme`. A hand-written `firefox:` variant plugin was deleted rather than ported — it had zero usages.
- If the Firefox floor ever becomes a real problem, reverting means returning to Tailwind v3 on Next 16, which remains supported.
