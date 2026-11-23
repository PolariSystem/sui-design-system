import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("icon buttons preserve size, focus, interaction and reduced motion", async ({
  page,
}, info) => {
  await page.goto("/#iconbutton");
  const section = page.locator("#iconbutton");
  for (const [size, dimension] of [
    ["sm", 32],
    ["md", 40],
    ["lg", 44],
  ] as const) {
    const button = section.getByRole("button", {
      name: `tertiary ${size} actions`,
      exact: true,
    });
    const box = (await button.boundingBox())!;
    expect(box.width).toBeCloseTo(dimension, 2);
    expect(box.height).toBeCloseTo(dimension, 2);
  }
  const action = section.getByRole("button", {
    name: "Record actions",
  });
  const press = section.getByRole("button", {
    name: "tertiary md actions",
    exact: true,
  });
  await press.hover();
  const resting = (await press.boundingBox())!;
  await page.mouse.down();
  await expect(press.locator(":scope > span")).toHaveCSS("scale", "0.97");
  const pressed = (await press.boundingBox())!;
  expect(pressed.width).toBeCloseTo(resting.width, 2);
  expect(pressed.height).toBeCloseTo(resting.height, 2);
  await page.mouse.up();
  // Switch back to keyboard modality before asserting the focus-visible ring.
  await page.keyboard.press("Tab");
  await action.focus();
  await expect(action).toBeFocused();
  await expect(action).toHaveCSS("outline-style", "solid");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("menu", { name: "Record actions" }),
  ).toBeVisible();
  await page.getByRole("menuitem", { name: "Duplicate record" }).click();
  await expect(section.getByRole("status")).toHaveText(
    "Record duplicated in this preview.",
  );
  await expect(action).toBeFocused();
  await expect(action).toHaveAttribute("aria-expanded", "false");
  await expect(
    section.locator(".sui-icon-button-icon > span").first(),
  ).not.toHaveCSS("mask-image", "none");
  await expect(
    section.getByRole("button", { name: "primary disabled actions" }),
  ).toBeDisabled();
  const pending = section.getByRole("button", {
    name: "primary pending actions",
  });
  await expect(pending).toBeDisabled();
  await expect(pending).toHaveAttribute("aria-busy", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(action).toHaveCSS("transition-duration", "0s");
  await expect(pending.locator(".sui-spinner")).toHaveCSS(
    "animation-name",
    "none",
  );
  expect(
    (
      await new AxeBuilder({ page })
        .include("#iconbutton")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await section.screenshot({ path: info.outputPath("icon-buttons.png") });
});
