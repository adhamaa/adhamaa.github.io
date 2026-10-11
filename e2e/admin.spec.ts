import { expect, test } from "@playwright/test";

/**
 * The editor itself is a third-party app that needs a GitHub sign-in, so it is
 * checked by hand. What the Site owes it is checked here: the page that loads
 * it, and the configuration it reads, are both served.
 */
test.describe("admin", () => {
  test("serves the editor page", async ({ request }) => {
    const response = await request.get("/admin/");

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("@sveltia/cms");
  });

  test("serves the editor's configuration next to it", async ({ request }) => {
    const response = await request.get("/admin/config.yml");

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("repo: adhamaa/adhamaa.github.io");
  });
});
