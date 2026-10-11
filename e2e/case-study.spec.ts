import { expect, test, type Page } from "@playwright/test";

/**
 * Case Studies as a visitor finds them: from a Project's card, at an address of
 * their own, and nowhere at all while they are Drafts. The Site's own Project
 * carries a published Case Study; AA Digital Works carries a Draft one.
 */
const workSection = (page: Page) =>
  page.getByRole("region", { name: "Selected work" });

const card = (page: Page, name: string) =>
  workSection(page)
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { name, exact: true }) });

test.describe("case study", () => {
  test("is read on its own page, reached from its Project's card", async ({ page }) => {
    await page.goto("/");

    await card(page, "adhamaa.github.io")
      .getByRole("link", { name: "Read the case study" })
      .click();

    await expect(page).toHaveURL(/\/work\/adhamaa-github-io$/);
    await expect(
      page.getByRole("heading", { level: 1, name: "adhamaa.github.io" })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 2, name: "Why a portfolio needs a pipeline" })
    ).toBeVisible();
  });

  test("shows no link while a Project's Case Study is a Draft", async ({ page }) => {
    await page.goto("/");

    await expect(card(page, "AA Digital Works")).toBeVisible();
    await expect(
      card(page, "AA Digital Works").getByRole("link", { name: "Read the case study" })
    ).toHaveCount(0);
  });

  test("has no page while it is a Draft", async ({ request }) => {
    const response = await request.get("/work/aa-digital-works");

    expect(response.status()).toBe(404);
  });
});

test.describe("case study discovery", () => {
  test("lists published Case Studies in the sitemap, and no Drafts", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();

    expect(sitemap).toContain("https://adhamaa.github.io/work/adhamaa-github-io");
    expect(sitemap).not.toContain("/work/aa-digital-works");
  });

  test("keeps Case Studies out of the main nav", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("navigation").first().getByRole("link", { name: /case stud/i })
    ).toHaveCount(0);
  });
});

test.describe("work list", () => {
  test("numbers Projects by their position", async ({ page }) => {
    await page.goto("/");

    await expect(card(page, "AA Digital Works")).toContainText("01");
    await expect(card(page, "adhamaa.github.io")).toContainText("05");
  });
});
