import { expect, test, type Page } from "@playwright/test";

/**
 * Case Studies as a visitor finds them: from a Project's card, at an address of
 * their own, in the sitemap, and nowhere in the nav.
 *
 * Content changes through the CMS without a code review, so nothing here names
 * a Project or assumes which ones are published. These are rules that hold for
 * any Content. Which Projects and Case Studies are Drafts is checked by the
 * content loader's own tests, against Content they build themselves.
 */
const workSection = (page: Page) =>
  page.getByRole("region", { name: "Selected work" });

/** Project cards only: each card's highlights are list items too. */
const cards = (page: Page) =>
  workSection(page)
    .getByRole("listitem")
    .filter({ has: page.getByRole("heading", { level: 3 }) });

/** Each card that links to a Case Study, as its Project's name and the link's address. */
async function caseStudyLinks(page: Page) {
  const links: { name: string; href: string }[] = [];
  for (const card of await cards(page).all()) {
    const link = card.getByRole("link", { name: "Read the case study" });
    if ((await link.count()) === 0) continue;
    links.push({
      name: (await card.getByRole("heading", { level: 3 }).innerText()).trim(),
      href: (await link.getAttribute("href")) ?? "",
    });
  }
  return links;
}

test.describe("case study", () => {
  test("every card's Case Study link opens a page about that Project", async ({ page }) => {
    await page.goto("/");
    const links = await caseStudyLinks(page);

    for (const { name, href } of links) {
      expect(href).toMatch(/^\/work\/[a-z0-9]+(?:-[a-z0-9]+)*$/);
      await page.goto(href);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
    }
  });

  test("has no page at an address that isn't a Case Study", async ({ request }) => {
    const response = await request.get("/work/no-such-project");

    expect(response.status()).toBe(404);
  });
});

test.describe("case study discovery", () => {
  test("lists exactly the linked Case Studies in the sitemap", async ({ page, request }) => {
    await page.goto("/");
    const linked = (await caseStudyLinks(page)).map(({ href }) => href).sort();

    const sitemap = await (await request.get("/sitemap.xml")).text();
    const listed = Array.from(
      sitemap.matchAll(/<loc>https?:\/\/[^/<]+(\/work\/[^<]+)<\/loc>/g),
      (match) => match[1]
    ).sort();

    expect(listed).toEqual(linked);
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

    const all = await cards(page).all();
    expect(all.length).toBeGreaterThan(0);
    for (let index = 0; index < all.length; index++) {
      await expect(all[index]).toContainText(String(index + 1).padStart(2, "0"));
    }
  });
});
