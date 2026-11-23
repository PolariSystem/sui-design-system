import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assetManifest from "../../src/assets/manifest.json" with { type: "json" };

test("workshop is accessible and fits the viewport", async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/#foundations");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  // Contrast belongs to the settled content, after the shared entrance fade.
  await expect
    .poll(() =>
      page
        .locator(".docs-page")
        .evaluate((element) => element.getAnimations().length),
    )
    .toBe(0);
  const audit = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(audit.violations).toEqual([]);
  expect(errors).toEqual([]);
  await page.screenshot({
    path: testInfo.outputPath("workshop.png"),
    fullPage: true,
  });
  for (const id of [
    "button",
    "input",
    "checkbox",
    "badge",
    "card",
    "textarea",
    "select",
    "radio",
    "switch",
    "otpinput",
    "passwordinput",
    "tag",
    "avatar",
    "link",
    "tabs",
    "breadcrumb",
    "pagination",
    "navbar",
    "sidebar",
    "stepper",
    "alert",
    "toast",
    "progress",
    "skeleton",
    "emptystate",
    "dialog",
    "drawer",
    "tooltip",
    "popover",
    "dropdownmenu",
    "datepicker",
    "timepicker",
    "calendar",
  ]) {
    await page.goto(`/#${id}`);
    await expect(page.locator(".workshop-section")).toHaveCount(1);
    await page
      .locator(`#${id}`)
      .screenshot({ path: testInfo.outputPath(`${id}.png`) });
  }
});

test("components retain geometry, native state and keyboard focus", async ({
  page,
}) => {
  await page.goto("/#button");
  await page.evaluate(() => document.fonts.ready);
  for (const [label, height] of [
    ["Small", 32],
    ["Medium", 40],
    ["Large", 44],
  ] as const) {
    const box = await page
      .getByRole("button", { name: label, exact: true })
      .boundingBox();
    expect(box?.height).toBe(height);
  }
  const primary = page.getByRole("button", { name: "Primary", exact: true });
  await expect(primary).toHaveCSS("background-color", "rgb(0, 111, 159)");
  await expect(primary).toHaveCSS("border-radius", "8px");
  await page.goto("/#input");
  await expect(
    page.getByLabel("Error", { exact: true }).locator(".."),
  ).toHaveCSS("border-color", "rgb(167, 53, 61)");
  await expect(
    page.getByRole("textbox", { name: "Disabled", exact: true }).locator(".."),
  ).toHaveCSS("background-color", "rgb(243, 246, 248)");
  await page.goto("/#checkbox");
  await expect(
    page
      .getByRole("checkbox", { name: "Checked", exact: true })
      .locator("..")
      .locator(".sui-checkbox-box"),
  ).toHaveCSS("border-color", "rgba(0, 0, 0, 0)");
  await page.goto("/#button");
  await expect(
    page.getByRole("button", { name: "Disabled", exact: true }),
  ).toHaveCSS("opacity", "0.4");
  await page.goto("/#checkbox");
  const check = page.getByRole("checkbox", { name: "Select all records" });
  await expect(check).toHaveJSProperty("indeterminate", true);
  await check.focus();
  await page.keyboard.press("Space");
  await expect(check).toBeChecked();
  await expect(page.getByText("2 of 2 records selected")).toBeVisible();
  // Measure settled artwork, not an intermediate selection-confirmation frame.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter(
          (animation) => animation.effect?.getTiming().iterations !== Infinity,
        )
        .map((animation) => animation.finished),
    ),
  );
  // Audit every asset in one browser round trip; reuse source reads for repeated icons.
  const assets = await page
    .locator("img")
    .evaluateAll(async (images: HTMLImageElement[]) => {
      const sources = new Map<
        string,
        Promise<{ width: number; height: number }>
      >();
      return Promise.all(
        images.map(async (image) => {
          const box = image.getBoundingClientRect();
          const visible =
            box.width > 0 &&
            box.height > 0 &&
            getComputedStyle(image).visibility !== "hidden" &&
            getComputedStyle(image).opacity !== "0";
          if (visible && !sources.has(image.src))
            sources.set(
              image.src,
              fetch(image.src)
                .then((response) => response.text())
                .then((xml) => {
                  const root = new DOMParser().parseFromString(
                    xml,
                    "image/svg+xml",
                  ).documentElement;
                  return {
                    width: Number(root.getAttribute("width")),
                    height: Number(root.getAttribute("height")),
                  };
                }),
            );
          return {
            loaded: image.complete && image.naturalWidth > 0,
            visible,
            width: box.width,
            height: box.height,
            dimensions: visible ? await sources.get(image.src) : undefined,
          };
        }),
      );
    });
  for (const asset of assets) {
    expect(asset.loaded).toBe(true);
    if (asset.visible) {
      const dimensions = asset.dimensions!;
      expect(
        assetManifest.assets.some(
          (entry) =>
            entry.width === dimensions.width &&
            entry.height === dimensions.height,
        ),
      ).toBe(true);
      expect(asset.width).toBeCloseTo(dimensions.width, 1);
      expect(asset.height).toBeCloseTo(dimensions.height, 1);
    }
  }
  await page.goto("/#input");
  const save = page.getByRole("button", { name: "Save changes", exact: true });
  await save.click();
  const profileEmail = page.locator("#input").getByLabel("Work email");
  await expect(profileEmail).toBeFocused();
  await expect(profileEmail.locator("..")).not.toHaveCSS("box-shadow", "none");
  await expect(page.getByText("Enter a valid work email.")).toBeVisible();
  await profileEmail.fill("team@example.com");
  await save.click();
  await expect(
    page.getByText("Changes saved for this preview. No data was sent."),
  ).toBeVisible();
  await page.goto("/#button");
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page
      .locator("#button .sui-spinner")
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe("none");
});
