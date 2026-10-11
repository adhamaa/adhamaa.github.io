import { expect, test } from "@playwright/test";

/**
 * Click-to-edit is for the owner inside the editor. Visitors' pages carry none
 * of its markers, before or after the page's scripts run.
 */
const pages = ["/", "/about"];

for (const path of pages) {
  test(`${path} carries no editor markers for visitors`, async ({ page, request }) => {
    expect(await (await request.get(path)).text()).not.toContain("data-tina-field");

    await page.goto(path);
    await expect(page.locator("[data-tina-field]")).toHaveCount(0);
  });
}

test("Case Study pages carry no editor markers for visitors", async ({ page }) => {
  await page.goto("/");
  const hrefs = await page
    .getByRole("region", { name: "Selected work" })
    .getByRole("link", { name: "Read the case study" })
    .evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));

  for (const href of hrefs) {
    await page.goto(href);
    await expect(page.locator("[data-tina-field]"), href).toHaveCount(0);
  }
});
