import { expect, test, type Page } from "@playwright/test";

const aboutHeading = (page: Page) =>
  page.getByRole("heading", { name: /Assalamualaykum/ });

test.describe("about", () => {
  test("renders its heading", async ({ page }) => {
    await page.goto("/about");

    await expect(aboutHeading(page)).toBeVisible();
  });

  test("is reachable from the home page", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "about" }).first().click();

    await expect(page).toHaveURL(/\/about$/);
    await expect(aboutHeading(page)).toBeVisible();
  });
});
