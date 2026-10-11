import { expect, test } from "@playwright/test";

/**
 * The editors are third-party apps that need a sign-in, so editing itself is
 * checked by hand. What the Site owes them is checked here: each is served
 * where the owner expects it.
 */
test.describe("admin", () => {
  test("serves the TinaCMS editor", async ({ request }) => {
    const response = await request.get("/admin/");

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("<title>TinaCMS</title>");
  });

  test("keeps the Sveltia fallback and its configuration", async ({ request }) => {
    const page = await request.get("/sveltia/");
    const config = await request.get("/sveltia/config.yml");

    expect(page.status()).toBe(200);
    expect(await page.text()).toContain("@sveltia/cms");
    expect(config.status()).toBe(200);
    expect(await config.text()).toContain("repo: adhamaa/adhamaa.github.io");
  });
});
