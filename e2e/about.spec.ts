import { expect, test } from "@playwright/test";

test.describe("about", () => {
  test("renders its heading", async ({ page }) => {
    await page.goto("/about");

    await expect(
      page.getByRole("heading", { level: 1, name: /Assalamualaykum/ })
    ).toBeVisible();
  });

  test("is reachable from the home page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "about" }).first().click();

    await expect(page).toHaveURL(/\/about$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Assalamualaykum/ })
    ).toBeVisible();
  });
});
