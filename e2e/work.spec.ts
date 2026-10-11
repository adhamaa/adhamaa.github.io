import { expect, test, type Page } from "@playwright/test";

/**
 * The work list and the experience timeline, read the way a visitor reads them:
 * by section, heading and link. Which Projects and Roles appear, and in what
 * order, is Content edited through the CMS, so these tests check the shape a
 * visitor relies on rather than naming any Project or Role.
 */
const workSection = (page: Page) =>
  page.getByRole("region", { name: "Selected work" });

const experienceSection = (page: Page) =>
  page.getByRole("region", { name: "Experience" });

test.describe("work", () => {
  test("shows each Project under its name", async ({ page }) => {
    await page.goto("/");

    const names = workSection(page).getByRole("heading", { level: 3 });
    expect(await names.count()).toBeGreaterThan(0);
    for (const name of await names.allInnerTexts()) {
      expect(name.trim()).not.toBe("");
    }
  });

  test("opens every live link in a new tab, safely", async ({ page }) => {
    await page.goto("/");

    const external = workSection(page).locator('a[href^="http"]');
    for (const link of await external.all()) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
  });
});

test.describe("experience", () => {
  test("shows each Role with its title and period", async ({ page }) => {
    await page.goto("/");

    const roles = experienceSection(page).getByRole("listitem").filter({
      has: page.getByRole("heading", { level: 3 }),
    });
    expect(await roles.count()).toBeGreaterThan(0);
    for (const role of await roles.all()) {
      await expect(role.getByRole("heading", { level: 3 })).not.toBeEmpty();
      await expect(role).toContainText(/\d{4}/);
    }
  });
});
