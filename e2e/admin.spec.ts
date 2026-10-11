import { expect, test } from "@playwright/test";

/**
 * The editor is a third-party app that needs a sign-in, so editing itself is
 * checked by hand. What the Site owes it is checked here: it is served where
 * the owner expects it.
 */
test.describe("admin", () => {
  test("serves the TinaCMS editor", async ({ request }) => {
    const response = await request.get("/admin/");

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("<title>TinaCMS</title>");
  });

  test("no longer serves the retired Sveltia editor", async ({ request }) => {
    const response = await request.get("/sveltia/");

    expect(response.status()).toBe(404);
  });
});
