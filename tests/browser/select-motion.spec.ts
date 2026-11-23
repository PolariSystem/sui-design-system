import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Select renders the approved menu, supports typeahead and restores focus", async ({
  page,
}, testInfo) => {
  await page.goto("/#checkbox");
  const approvedCheck = await page
    .locator("#checkbox .sui-checkmark")
    .first()
    .getAttribute("src");
  await page.goto("/#select");
  await page.evaluate(() => document.fonts.ready);
  const trigger = page.getByRole("combobox", { name: "Record category" });
  await trigger.click();
  const menu = page.getByRole("listbox");
  await expect(menu).toBeVisible();
  await expect(menu).toHaveCSS("border-radius", "12px");
  await expect(menu).toHaveCSS("padding", "8px");
  await expect(menu).not.toHaveCSS("box-shadow", "none");
  await menu.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  );
  const selected = page.getByRole("option", {
    name: "Operations",
    exact: true,
  });
  await expect(selected).toHaveAttribute("aria-selected", "true");

  await expect(selected.locator("img")).toHaveAttribute("src", approvedCheck!);
  const row = await selected.boundingBox();
  const next = await page
    .getByRole("option", { name: "Research", exact: true })
    .boundingBox();
  expect(row!.height).toBe(40);
  expect(next!.y - row!.y - row!.height).toBe(4);
  await expect(
    page.getByRole("option", { name: "Archived (unavailable)" }),
  ).toHaveAttribute("aria-disabled", "true");
  const box = await menu.boundingBox();
  const viewport = page.viewportSize()!;
  expect(box!.x).toBeGreaterThanOrEqual(8);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width - 8);
  expect(box!.y).toBeGreaterThanOrEqual(8);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport.height - 8);
  await page.keyboard.press("Tab");
  await expect(selected).toBeFocused();
  // Radix hides the background and confines focus while the listbox is open.
  // Audit the active popup here; the separate workshop audit covers the full page
  // when it is available to keyboard and assistive technology users.
  const audit = await new AxeBuilder({ page })
    .include(".sui-select-popup")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath("select-open.png") });
  await page.keyboard.type("fin");
  await expect(
    page.getByRole("option", { name: "Finance", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(trigger).toHaveText("Finance");
  await expect(trigger).toBeFocused();
  await trigger.click();
  await expect(
    page.getByRole("option", { name: "Finance", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Home");
  await expect(selected).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toHaveText("Finance");
  await expect(trigger).toBeFocused();
});

test("Select handles pointer selection, outside dismissal and narrow viewports", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/#select");
  const trigger = page.getByRole("combobox", { name: "Record category" });
  await trigger.click();
  await page.getByRole("option", { name: "Research", exact: true }).click();
  await expect(trigger).toHaveText("Research");
  await expect(page.getByRole("listbox")).toBeHidden();
  await trigger.click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(page.getByRole("listbox")).toBeHidden();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("motion interpolates the switch, reverses smoothly and honors reduced motion", async ({
  page,
}) => {
  await page.goto("/#switch");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const toggle = page.getByRole("switch", { name: "Email notifications" });
  const thumb = toggle.locator("..").locator(".sui-switch-thumb");
  await expect(thumb).toHaveCSS("transform", "matrix(1, 0, 0, 1, 16, 0)");
  await expect(thumb).toHaveCSS("width", "16px");
  await expect(thumb).toHaveCSS("height", "16px");
  // Sample the actual CSS transition halfway through its timeline, independently of
  // machine speed. The semantic state must already be updated at this point.
  const sample = await toggle.evaluate(async (element: HTMLInputElement) => {
    const thumb =
      element.parentElement!.querySelector<HTMLElement>(".sui-switch-thumb")!;
    element.click();
    getComputedStyle(thumb).transform;
    const animation = thumb.getAnimations()[0];
    if (!animation)
      throw new Error("Switch did not start a transform transition");
    animation.pause();
    animation.currentTime = 100;
    const x = new DOMMatrix(getComputedStyle(thumb).transform).m41;
    const checked = element.checked;
    animation.play();
    await animation.finished;
    element.click();
    getComputedStyle(thumb).transform;
    const reverse = thumb.getAnimations()[0];
    if (!reverse)
      throw new Error("Switch did not animate the reverse direction");
    reverse.pause();
    reverse.currentTime = 100;
    const reverseX = new DOMMatrix(getComputedStyle(thumb).transform).m41;
    reverse.play();
    await reverse.finished;
    return { x, reverseX, checked };
  });
  expect(sample.checked).toBe(false);
  expect(sample.x).toBeGreaterThan(0);
  expect(sample.x).toBeLessThan(16);
  expect(sample.reverseX).toBeGreaterThan(0);
  expect(sample.reverseX).toBeLessThan(16);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await toggle.click();
  await expect(thumb).toHaveCSS("transition-duration", "0s");
  await expect(thumb).toHaveCSS("transform", "none");
  for (const [route, selector] of [
    ["button", ".sui-button"],
    ["input", ".sui-input-control"],
    ["checkbox", ".sui-checkbox-box"],
    ["checkbox", ".sui-checkmark"],
    ["radio", ".sui-radio-selected"],
    ["otpinput", ".sui-otp-cell"],
    ["passwordinput", ".sui-password-toggle"],
    ["badge", ".sui-badge"],
    ["card", ".sui-card"],
  ]) {
    await page.goto("/#" + route);
    expect(
      await page
        .locator(selector)
        .first()
        .evaluate((el) =>
          getComputedStyle(el)
            .transitionDuration.split(",")
            .every((value) => parseFloat(value) === 0),
        ),
    ).toBe(true);
  }
  await page.goto("/#select");
  await page.getByRole("combobox", { name: "Record category" }).click();
  await expect(page.getByRole("listbox")).toHaveCSS("animation-name", "none");
});
