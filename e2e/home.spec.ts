import { expect, test } from "@playwright/test";

/**
 * Assertions here are deliberately limited to what a visitor can read on screen.
 * No class names, DOM structure or component markup: every one of those changes
 * by design during the upgrade, and asserting on them would produce failures
 * that teach us to ignore the suite.
 */
test.describe("home", () => {
  test("renders its heading", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Adham Akmal Azmi." })).toBeVisible();
  });

  test("renders the selected work section", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Selected work" })).toBeVisible();
  });
});
