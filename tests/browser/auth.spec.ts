import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("login validates, submits once, supports password visibility and recovers from provider failure", async ({
  page,
}) => {
  await page.goto("/#signinform");
  const section = page.locator("#signinform");
  const form = section.getByRole("form", { name: "Sign in" });
  await form.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(form.getByLabel("Work email")).toBeFocused();
  await expect(form.getByLabel("Work email")).toHaveAccessibleDescription(
    "Enter your work email.",
  );
  await form.getByLabel("Work email").fill("team@example.com");
  await form.getByLabel("Password", { exact: true }).fill("Example password");
  await form.getByRole("button", { name: "Show password" }).focus();
  await page.keyboard.press("Enter");
  await expect(form.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.keyboard.press("Enter");
  await expect(form.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "password",
  );
  await section.getByRole("combobox", { name: "Preview result" }).click();
  await page.getByRole("option", { name: "Rejected response" }).click();
  await form.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    form.getByRole("button", { name: "Signing in", exact: true }),
  ).toBeDisabled();
  await expect(
    form.getByRole("link", { name: "Forgot password?" }),
  ).toHaveAttribute("aria-disabled", "true");
  await expect(form.getByRole("alert")).toHaveText(
    "Unable to sign in. Check your details and try again.",
  );
  expect(
    (
      await new AxeBuilder({ page })
        .include("#signinform")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await expect(form.getByLabel("Password", { exact: true })).toHaveValue(
    "Example password",
  );
  await section.getByRole("combobox", { name: "Preview result" }).click();
  await page.getByRole("option", { name: "Successful response" }).click();
  await form.getByLabel("Password", { exact: true }).press("Enter");
  await expect(
    section.getByText("Preview complete. No sign-in request was sent."),
  ).toBeVisible();
  await expect(form.getByRole("alert")).toHaveCount(0);
  await form.getByRole("link", { name: "Forgot password?" }).click();
  await expect(
    section.getByRole("heading", { name: "Forgot your password?" }),
  ).toBeFocused();
});

test("login matches responsive card geometry, original assets and accessible layout", async ({
  page,
}, testInfo) => {
  await page.setViewportSize(
    testInfo.project.name === "desktop"
      ? { width: 1440, height: 1200 }
      : { width: 392, height: 940 },
  );
  await page.goto("/?preview=signin");
  await page.evaluate(() => document.fonts.ready);
  const card = page.locator(".sui-auth-card");
  const box = (await card.boundingBox())!;
  expect(box.width).toBe(testInfo.project.name === "desktop" ? 448 : 352);
  const viewport = page.viewportSize()!;
  expect(box.x + box.width / 2).toBeCloseTo(viewport.width / 2, 1);
  expect(box.y + box.height / 2).toBeCloseTo(viewport.height / 2, 1);
  await expect(card).toHaveCSS(
    "padding",
    testInfo.project.name === "desktop" ? "32px" : "16px",
  );
  await expect(page.locator(".sui-auth-frost")).toHaveCSS(
    "backdrop-filter",
    "blur(12px)",
  );
  const assets = await card
    .locator("img:visible")
    .evaluateAll(async (elements) =>
      Promise.all(
        elements.map(async (element) => {
          const image = element as HTMLImageElement;
          const source = await (await fetch(image.src)).text();
          const root = new DOMParser().parseFromString(
            source,
            "image/svg+xml",
          ).documentElement;
          const rect = image.getBoundingClientRect();
          return {
            loaded: image.complete && image.naturalWidth > 0,
            width: rect.width,
            height: rect.height,
            originalWidth: Number(root.getAttribute("width")),
            originalHeight: Number(root.getAttribute("height")),
          };
        }),
      ),
    );
  for (const asset of assets) {
    expect(asset.loaded).toBe(true);
    expect(asset.width).toBeCloseTo(asset.originalWidth, 1);
    expect(asset.height).toBeCloseTo(asset.originalHeight, 1);
  }
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  // Freeze the opening state for comparison with the Figma screenshot.
  await page.evaluate(() =>
    document.getAnimations().forEach((animation) => {
      animation.pause();
      animation.currentTime = 0;
    }),
  );
  await page.screenshot({
    path: testInfo.outputPath("sign-in.png"),
    fullPage: true,
  });
  await page.evaluate(() =>
    document.getAnimations().forEach((animation) => {
      animation.currentTime = 6000;
    }),
  );
  await page.screenshot({
    path: testInfo.outputPath("sign-in-leaf.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 320, height: 640 });
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("sign-in-narrow-errors.png"),
    fullPage: true,
  });
});

test("leaf preserves its path, timeline and pause state across form edits and reduced motion", async ({
  page,
}, testInfo) => {
  await page.goto("/?preview=signin");
  const leaf = page.locator(
    testInfo.project.name === "desktop"
      ? ".sui-auth-leaf-desktop"
      : ".sui-auth-leaf-mobile",
  );
  const path = leaf.locator(".sui-auth-leaf-glow > path");
  await expect(page.locator(".sui-auth-leaf")).toHaveAttribute(
    "data-paused",
    "false",
  );
  await expect(path).toHaveCSS("animation-duration", "14.02s");
  await expect(path).toHaveAttribute("pathLength", "1");
  const original = await path.getAttribute("d");
  const handle = await path.elementHandle();
  await page
    .getByRole("button", { name: "Pause background animation" })
    .click();
  await expect(path).toHaveCSS("animation-play-state", "paused");
  await page.getByLabel("Work email").fill("team@example.com");
  expect(await handle!.evaluate((node) => node.isConnected)).toBe(true);
  expect(await path.getAttribute("d")).toBe(original);
  for (const [time, expectedOffset] of [
    [6000, "0px"],
    [13000, "-1px"],
  ] as const) {
    await path.evaluate((node, time) => {
      for (const animation of node.getAnimations())
        animation.currentTime = time;
    }, time);
    await expect(path).toHaveCSS("stroke-dashoffset", expectedOffset);
  }
  await page
    .getByRole("button", { name: "Resume background animation" })
    .click();
  await expect(path).toHaveCSS("animation-play-state", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(path).toHaveCSS("animation-name", "none");
  await expect(path).toHaveCSS("visibility", "visible");
  await expect(
    page.getByRole("button", { name: "Pause background animation" }),
  ).toHaveCount(0);
  expect(await path.evaluate((node) => node.getAnimations().length)).toBe(0);
});

test("leaf completes its drawing and erasing cycle without shifting the card", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop",
    "One real-time cycle validates the shared desktop/mobile keyframes.",
  );
  test.setTimeout(45_000);
  await page.goto("/?preview=signin");
  const path = page.locator(
    ".sui-auth-leaf-desktop .sui-auth-leaf-glow > path",
  );
  await expect(page.locator(".sui-auth-leaf")).toHaveAttribute(
    "data-paused",
    "false",
  );
  const before = await page.locator(".sui-auth-card").boundingBox();
  await page.evaluate(() =>
    document.getAnimations().forEach((animation) => {
      animation.currentTime = 0;
    }),
  );
  // Observe rendered phases instead of accumulating sleeps plus screenshot overhead.
  // Under CI load, a screenshot can otherwise push the erasure check into the next loop.
  await expect(path).toHaveCSS("stroke-dasharray", "1px, 1px");
  await page.screenshot({ path: testInfo.outputPath("leaf-cycle-drawn.png") });
  await page.waitForFunction(
    (node) => node && getComputedStyle(node).visibility === "hidden",
    await path.elementHandle(),
    { timeout: 20_000 },
  );
  await expect
    .poll(
      () =>
        path.evaluate(
          (node) =>
            node.getAnimations()[0].effect!.getComputedTiming()
              .currentIteration,
        ),
      { timeout: 20_000 },
    )
    .toBeGreaterThanOrEqual(1);
  expect(await page.locator(".sui-auth-card").boundingBox()).toEqual(before);
});
