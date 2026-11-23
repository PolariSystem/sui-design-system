import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("horizontal previews let vertical wheel gestures reach the content panel", async ({
  page,
}) => {
  await page.setViewportSize({ width: 392, height: 852 });
  await page.goto("/#scrollarea");
  const code = page.getByLabel("Project milestones", { exact: true });
  await code.scrollIntoViewIfNeeded();
  const viewport = page.locator(".docs-main > [data-sui-scroll-viewport]");
  const before = await viewport.evaluate((n) => n.scrollTop);
  await code.hover();
  await page.mouse.wheel(0, -200);
  await expect
    .poll(() => viewport.evaluate((n) => n.scrollTop))
    .toBeLessThan(before);
});

test("touch swipes scroll Pages inside its rounded viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 392, height: 852 });
  await page.goto("/#signinform");
  const viewport = page.locator(".docs-main > [data-sui-scroll-viewport]");
  const client = await page.context().newCDPSession(page);
  try {
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: 200, y: 650, id: 1 }],
    });
    for (let y = 610; y >= 290; y -= 40) {
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: 200, y, id: 1 }],
      });
    }
    await client.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect
      .poll(() => viewport.evaluate((n) => n.scrollTop))
      .toBeGreaterThan(100);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  } finally {
    await client.detach();
  }
});

test("dragging a dashboard widget scrolls the containing panel at its edge", async ({
  page,
}) => {
  await page.goto("/#dashboard");
  await page.getByRole("button", { name: "Customize dashboard" }).click();
  const viewport = page.locator(".docs-main > [data-sui-scroll-viewport]");
  const handle = page.getByRole("button", {
    name: "Drag Created records",
    exact: true,
  });
  await handle.evaluate((n) => n.scrollIntoView({ block: "center" }));
  const before = await viewport.evaluate((n) => n.scrollTop);
  const start = (await handle.boundingBox())!;
  const bounds = (await viewport.boundingBox())!;
  await page.mouse.move(start.x + 8, start.y + 8);
  await page.mouse.down();
  await page.mouse.move(start.x + 8, bounds.y + bounds.height - 20, {
    steps: 8,
  });
  await expect
    .poll(() => viewport.evaluate((n) => n.scrollTop))
    .toBeGreaterThan(before + 80);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(page.locator("[data-dragging='true']")).toHaveCount(0);
});

test("Pages keeps its last content above navigation without scrolling the document", async ({
  page,
}) => {
  await page.setViewportSize({ width: 392, height: 852 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const route of ["dashboard", "signinform"]) {
    await page.goto(`/#${route}`);
    await expect(page.locator(`#${route}`)).toBeVisible();
    // Route navigation restores focus and scroll on the next animation frame.
    await expect(page.locator("#main")).toBeFocused();
    const header = (await page.locator(".site-header").boundingBox())!;
    const panel = (await page.locator(".docs-main").boundingBox())!;
    const navigation = (await page.locator(".site-bottom-nav").boundingBox())!;
    expect(panel.y - (header.y + header.height)).toBe(16);
    expect(navigation.y - (panel.y + panel.height)).toBe(16);
    const viewport = page.locator(".docs-main > [data-sui-scroll-viewport]");
    await viewport.focus();
    await page.keyboard.press("Control+End");
    await expect
      .poll(() =>
        viewport.evaluate((n) =>
          Math.abs(n.scrollHeight - n.clientHeight - n.scrollTop),
        ),
      )
      .toBeLessThan(2);
    const footer = (await page.locator(".docs-footer").boundingBox())!;
    const bottom = (await page.locator(".site-bottom-nav").boundingBox())!;
    expect(footer.y + footer.height).toBeLessThan(bottom.y);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    const saved = await viewport.evaluate((n) => n.scrollTop);
    await page.getByRole("button", { name: "Open Pages index" }).click();
    await page.keyboard.press("Escape");
    expect(await viewport.evaluate((n) => n.scrollTop)).toBe(saved);
    await viewport.hover();
    await page.mouse.wheel(0, 1000);
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  }
});

test("overlay indicators are inset 4 px and do not reserve a content gutter", async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 392, height: 852 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    await page.goto("/#scrollarea");
    const viewport = page.getByLabel("Workspace activity", { exact: true });
    const root = viewport.locator("..");
    const thumb = root.locator(".sui-scrollbar-thumb");
    await expect(thumb).toBeVisible();
    const geometry = await viewport.evaluate((n) => {
      const root = n.parentElement!;
      const bar = root.querySelector(".sui-scrollbar-thumb")!;
      const r = root.getBoundingClientRect(),
        t = bar.getBoundingClientRect();
      return {
        gutter: n.getBoundingClientRect().width - n.clientWidth,
        inset:
          r.right -
          parseFloat(getComputedStyle(root).borderRightWidth) -
          t.right,
        width: t.width,
      };
    });
    expect(geometry).toEqual({ gutter: 0, inset: 4, width: 4 });
    const contentWidth = await viewport.evaluate((n) => n.clientWidth);
    await page.getByRole("button", { name: "Show fewer items" }).click();
    await expect(thumb).toHaveCount(0);
    expect(await viewport.evaluate((n) => n.clientWidth)).toBe(contentWidth);
    await page.getByRole("button", { name: "Show all items" }).click();
    await expect(thumb).toBeVisible();
    await viewport.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: info.outputPath(`scroll-area-${colorScheme}.png`),
    });
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
});

test("thumb dragging, track clicks and horizontal keyboard scrolling move real content", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1020 });
  await page.goto("/#scrollarea");
  const viewport = page.getByLabel("Workspace activity", { exact: true });
  const root = viewport.locator("..");
  const thumb = root.locator(".sui-scrollbar-thumb");
  const box = (await thumb.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 80, {
    steps: 8,
  });
  await page.mouse.up();
  await expect
    .poll(() => viewport.evaluate((n) => n.scrollTop))
    .toBeGreaterThan(100);
  await viewport.evaluate((n) => n.scrollTo(0, 0));
  const track = (await root.locator(".sui-scrollbar").boundingBox())!;
  await page.mouse.click(
    track.x + track.width / 2,
    track.y + track.height - 16,
  );
  await expect
    .poll(() => viewport.evaluate((n) => n.scrollTop))
    .toBeGreaterThan(100);
  const horizontal = page.getByLabel("Project milestones", { exact: true });
  await horizontal.focus();
  await page.keyboard.press("ArrowRight");
  await expect
    .poll(() => horizontal.evaluate((n) => n.scrollLeft))
    .toBeGreaterThan(0);
});

test("responsive headings change at 640 px while body text and primitive spacing stay stable", async ({
  page,
}) => {
  await page.goto("/#button");
  for (const [width, size, line] of [
    [392, "24px", "32px"],
    [640, "32px", "40px"],
  ] as const) {
    await page.setViewportSize({ width, height: 852 });
    await expect(page.locator("#Button-title")).toHaveCSS("font-size", size);
    await expect(page.locator("#Button-title")).toHaveCSS("line-height", line);
    await expect(page.locator("#button > div > div > p").first()).toHaveCSS(
      "font-size",
      "14px",
    );
    expect(
      await page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue("--sui-primitive-dimension-24")
          .trim(),
      ),
    ).toBe("24");
    await expect(
      page.locator(".docs-main-content"),
    ).toHaveCSS("padding", "16px");
  }
});
