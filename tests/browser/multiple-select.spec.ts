import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("multiple selection uses right-side checkboxes, stays open and dismisses on outside actions", async ({
  page,
}, testInfo) => {
  await page.goto("/#checkbox");
  const approved = await page
    .locator("#checkbox .sui-checkmark")
    .first()
    .getAttribute("src");
  await page.goto("/#select");
  await page.evaluate(() => document.fonts.ready);
  const trigger = page.getByRole("combobox", { name: "Workspace teams" });
  await trigger.click();
  const menu = page.getByRole("listbox");
  await expect(menu).toHaveAttribute("aria-multiselectable", "true");
  await expect(menu).toHaveCSS("padding", "8px");
  await expect(menu).toHaveCSS("border-radius", "12px");
  await expect(menu).not.toContainText("Available teams");
  await expect(menu).not.toContainText("Workspace teams");
  await expect(menu.getByRole("heading")).toHaveCount(0);
  await expect(menu.getByRole("checkbox")).toHaveCount(0);
  const operations = menu.getByRole("option", {
    name: "Operations",
    exact: true,
  });
  const product = menu.getByRole("option", { name: "Product", exact: true });
  const support = menu.getByRole("option", { name: "Support", exact: true });
  await expect(operations).toHaveAttribute("aria-selected", "false");
  await expect(operations.locator(".sui-checkmark")).toHaveCSS("opacity", "0");
  await menu.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  );
  const row = (await operations.boundingBox())!;
  const checkbox = (await operations
    .locator(".sui-selection-indicator")
    .boundingBox())!;
  expect(row.height).toBe(40);
  expect(checkbox.width).toBe(20);
  expect(checkbox.height).toBe(20);
  expect(row.x + row.width - checkbox.x - checkbox.width).toBe(8);
  expect(checkbox.y - row.y).toBe(10);
  const next = (await product.boundingBox())!;
  expect(next.y - row.y - row.height).toBe(4);
  await support.click();
  await operations.click();
  await expect(menu).toBeVisible();
  await expect(trigger).toHaveText("Operations, Support");
  await expect(operations).toHaveAttribute("aria-selected", "true");
  await expect(operations.locator(".sui-checkmark")).toHaveCSS("opacity", "1");

  await expect(operations.locator(".sui-checkmark")).toHaveAttribute(
    "src",
    approved!,
  );
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath("multiple-select-open.png"),
  });
  // A non-modal popup must let the same outside click activate the requested action.
  await page.getByRole("button", { name: "Save teams", exact: true }).click();
  await expect(menu).toBeHidden();
  await expect(
    page.getByRole("status").filter({ hasText: "Saved teams:" }),
  ).toContainText("operations, support");
  await trigger.click();
  await operations.click();
  await expect(trigger).toHaveText("Support");
  await expect(menu).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(menu).toBeHidden();
  await page.getByRole("button", { name: "Clear teams", exact: true }).click();
  await expect(trigger).toHaveText("Select teams");
});

test("multiple selection separates keyboard focus from selection and exits in document order", async ({
  page,
}) => {
  await page.goto("/#select");
  const trigger = page.getByRole("combobox", { name: "Workspace teams" });
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  const operations = page.getByRole("option", {
    name: "Operations",
    exact: true,
  });
  const product = page.getByRole("option", { name: "Product", exact: true });
  const support = page.getByRole("option", { name: "Support", exact: true });
  await expect(operations).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(product).toBeFocused();
  await expect(trigger).toHaveText("Select teams");
  await page.keyboard.press("Space");
  await expect(product).toHaveAttribute("aria-selected", "true");
  await expect(product).toBeFocused();
  await page.keyboard.press("End");
  await expect(support).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(support).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(operations).toBeFocused();
  await page.keyboard.type("sup");
  await expect(support).toBeFocused();
  await page.keyboard.press("Space");
  await expect(trigger).toHaveText("Product");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(product).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("listbox")).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Save teams", exact: true }),
  ).toBeFocused();
  await trigger.focus();
  await page.keyboard.press("ArrowUp");
  await expect(support).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("listbox")).toBeHidden();
  await expect(
    page.getByRole("combobox", { name: "Record category", exact: true }),
  ).toBeFocused();
});

test("multiple selection fits field values at 320px and honors reduced motion", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#select");
  const trigger = page.getByRole("combobox", { name: "Workspace teams" });
  await trigger.click();
  const menu = page.getByRole("listbox");
  await expect(menu).toHaveCSS("animation-name", "none");
  for (const name of ["Operations", "Product", "Support"]) {
    await page.getByRole("option", { name, exact: true }).click();
  }
  await expect(trigger).toHaveText("Operations, Product, Support");
  const field = (await trigger.boundingBox())!;
  const popup = (await menu.boundingBox())!;
  expect(field.height).toBeGreaterThanOrEqual(44);
  // A full-width field may fit all values on one line; verify no text is clipped.
  expect(
    await trigger.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const text = range.getBoundingClientRect();
      const bounds = element.getBoundingClientRect();
      return text.left >= bounds.left && text.right <= bounds.right &&
        text.top >= bounds.top && text.bottom <= bounds.bottom;
    }),
  ).toBe(true);
  expect(popup.x).toBeGreaterThanOrEqual(8);
  expect(popup.x + popup.width).toBeLessThanOrEqual(312);
  expect(popup.y).toBeGreaterThanOrEqual(8);
  expect(popup.y + popup.height).toBeLessThanOrEqual(560);
  expect(
    await menu
      .locator(".sui-checkmark")
      .first()
      .evaluate((element) =>
        getComputedStyle(element)
          .transitionDuration.split(",")
          .every((duration) => parseFloat(duration) === 0),
      ),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("multiple-select-narrow.png"),
  });
  await page.emulateMedia({ forcedColors: "active" });
  await expect(menu.locator(".sui-checkmark").first()).toHaveCSS(
    "opacity",
    "1",
  );
  await expect(
    menu.getByRole("option", { name: "Operations", exact: true }),
  ).toHaveCSS("border-top-width", "1px");
});
