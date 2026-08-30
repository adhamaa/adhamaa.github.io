import { defineConfig, devices } from "@playwright/test";

/**
 * The smoke suite runs a real browser against the static export in `out/` —
 * the exact artifact that deploys to GitHub Pages.
 *
 * This is the highest available seam and the only one that sits outside the
 * stack being upgraded, so the tests cannot be broken by the framework, bundler
 * or styling changes they exist to police. Build first (`pnpm run test:e2e`
 * does both), or reuse an existing `out/` with `pnpm exec playwright test`.
 */
const port = 4321;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["list"], ["html", { open: "never" }]]
    : [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `node e2e/static-server.mjs ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
    stderr: "pipe",
  },
});
