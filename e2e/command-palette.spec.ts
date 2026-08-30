import { expect, test, type Page } from "@playwright/test";

/**
 * The palette is the one widget the upgrade rewrites outright: it moves off
 * `cmdk` onto React Aria's autocomplete primitive. These assertions pin what a
 * visitor can do with it — open, filter, activate, dismiss — so the rewrite has
 * a baseline to be held to, and so a major bump of the current library cannot
 * break it quietly.
 */
const palettePlaceholder = /Type a command or search/;

const paletteInput = (page: Page) => page.getByPlaceholder(palettePlaceholder);

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Adham Akmal Azmi." })).toBeVisible();

  // The shortcut is bound in an effect, so pressing it before hydration does
  // nothing. The theme toggle only names a direction once mounted, which makes
  // it the page's own signal that client code is running.
  await expect(
    page.getByRole("button", { name: /Switch to (light|dark) theme/ })
  ).toBeVisible();
});

test.describe("command palette", () => {
  test("opens with the keyboard shortcut", async ({ page }) => {
    await page.keyboard.press("ControlOrMeta+k");

    await expect(paletteInput(page)).toBeVisible();
    await expect(page.getByText("Navigate")).toBeVisible();
  });

  test("opens from the search trigger in the nav", async ({ page }) => {
    await page.getByText("Search", { exact: true }).click();

    await expect(paletteInput(page)).toBeVisible();
  });

  test("filters as the visitor types", async ({ page }) => {
    await page.keyboard.press("ControlOrMeta+k");
    // Both strings appear only inside the palette; page headings such as
    // "Experience" also exist on the home page and would match twice.
    await paletteInput(page).fill("theme");

    await expect(page.getByText("Light theme")).toBeVisible();
    await expect(page.getByText("Copy email")).toBeHidden();
  });

  test("says so when nothing matches", async ({ page }) => {
    await page.keyboard.press("ControlOrMeta+k");
    await paletteInput(page).fill("nothing here matches");

    await expect(page.getByText("No results.")).toBeVisible();
  });

  test("activates the highlighted result with Enter", async ({ page }) => {
    await page.keyboard.press("ControlOrMeta+k");
    await paletteInput(page).fill("lab");
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/table$/);
    await expect(paletteInput(page)).toBeHidden();
  });

  test("dismisses with Escape", async ({ page }) => {
    await page.keyboard.press("ControlOrMeta+k");
    await expect(paletteInput(page)).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(paletteInput(page)).toBeHidden();
  });
});
