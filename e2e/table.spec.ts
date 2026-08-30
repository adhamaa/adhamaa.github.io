import { expect, test, type Page } from "@playwright/test";

/**
 * The static export prerenders only the table's first page; its second page,
 * sorting and search exist solely in the browser. Asserting over the built HTML
 * would therefore cover a fraction of this route and none of its behaviour,
 * which is why this suite drives a real browser instead.
 */

/**
 * Restated here rather than imported from the page: the suite asserts what a
 * visitor sees, so it must fail if the seven rows the spec promises change,
 * not quietly follow the source.
 */
const allDeploymentIds = [
  "dpl_9fa21",
  "dpl_9f8c4",
  "dpl_9f7b0",
  "dpl_9f6aa",
  "dpl_9f512",
  "dpl_9f4d8",
  "dpl_9f3c1",
];

/** Deployment ids currently on screen, in the order a visitor reads them. */
function deploymentIdsOnScreen(page: Page) {
  return page.getByText(/^dpl_[0-9a-z]+$/).allTextContents();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/table");
  await expect(page.getByText(allDeploymentIds[0])).toBeVisible();
});

test.describe("deployment table", () => {
  test("renders all seven deployments across its pages", async ({ page }) => {
    await expect(page.getByText("7 rows")).toBeVisible();

    const firstPage = await deploymentIdsOnScreen(page);
    // The pagination control is an icon, so its accessible name is the only
    // handle a visitor-level test has. Wording may shift; the match is loose.
    await page.getByRole("button", { name: /next page/i }).click();
    const secondPage = await deploymentIdsOnScreen(page);

    expect([...firstPage, ...secondPage].sort()).toEqual(
      [...allDeploymentIds].sort()
    );
  });

  test("sorts by deployment", async ({ page }) => {
    const beforeSorting = await deploymentIdsOnScreen(page);
    expect(beforeSorting[0]).not.toBe("dpl_9f3c1");

    await page.getByText("Deployment", { exact: true }).click();

    const afterSorting = await deploymentIdsOnScreen(page);
    expect(afterSorting).toEqual([...afterSorting].sort());
    expect(afterSorting[0]).toBe("dpl_9f3c1");
  });

  test("filters rows by search", async ({ page }) => {
    await page.getByPlaceholder(/Filter deployments/).fill("marquee");

    await expect(page.getByText("dpl_9f7b0")).toBeVisible();
    expect(await deploymentIdsOnScreen(page)).toEqual(["dpl_9f7b0"]);
  });

  test("shows no deployments when the search matches nothing", async ({ page }) => {
    await page.getByPlaceholder(/Filter deployments/).fill("nothing matches this");

    await expect(page.getByText(allDeploymentIds[0])).toBeHidden();
    expect(await deploymentIdsOnScreen(page)).toEqual([]);
  });
});
