import { expect, test, type Page } from "@playwright/test";

/**
 * The work list and the experience timeline, read the way a visitor reads them:
 * by section, heading and link. Which Projects and Roles appear, and in what
 * order, is Content — these tests pin the order and links that matter.
 */
const workSection = (page: Page) =>
  page.getByRole("region", { name: "Selected work" });

const experienceSection = (page: Page) =>
  page.getByRole("region", { name: "Experience" });

test.describe("work", () => {
  test("leads with AA Digital Works", async ({ page }) => {
    await page.goto("/");

    const projects = workSection(page).getByRole("heading", { level: 3 });
    await expect(projects.first()).toHaveText("AA Digital Works");
  });

  test("links AA Digital Works to its public site", async ({ page }) => {
    await page.goto("/");

    const card = workSection(page)
      .getByRole("listitem")
      .filter({ has: page.getByRole("heading", { name: "AA Digital Works" }) });
    await expect(card.getByRole("link", { name: /visit/ })).toHaveAttribute(
      "href",
      "https://aa.digitalworks.com.my/"
    );
  });
});

test.describe("experience", () => {
  test("shows AA Digital Works as the current Role", async ({ page }) => {
    await page.goto("/");

    const current = experienceSection(page).getByRole("listitem").first();
    await expect(current.getByRole("heading", { level: 3 })).toContainText(
      "AA Digital Works"
    );
    await expect(current).toContainText("Sep 2026 — present");
  });
});
