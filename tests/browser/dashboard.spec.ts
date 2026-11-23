import { test, expect, type Page, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("dashboard edits support keyboard movement, size drafts, cancellation and profile persistence", async ({
  page,
}) => {
  await page.goto("/#dashboard");
  const dashboard = page.locator("#dashboard");
  await dashboard.getByRole("button", { name: "Customize dashboard" }).click();
  const card = dashboard.getByRole("group", {
    name: "Active records",
    exact: true,
  });
  await card
    .getByRole("button", { name: "Widget actions for Active records" })
    .focus();
  await page.keyboard.press("Enter");
  await page.getByRole("menuitem", { name: "Move later", exact: true }).click();
  await expect(
    card.getByRole("button", { name: "Drag Active records" }),
  ).toBeFocused();
  await card.getByRole("button", { name: "Settings" }).click();
  let dialog = page.getByRole("dialog", { name: "Active records settings" });
  await dialog.getByRole("radio", { name: "Large (L)" }).check();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(card.locator("[data-size-chip]")).toHaveText("S");
  await card.getByRole("button", { name: "Settings" }).click();
  dialog = page.getByRole("dialog", { name: "Active records settings" });
  await dialog.getByRole("radio", { name: "Large (L)" }).check();
  await dialog.getByRole("button", { name: "Apply size" }).click();
  await expect(card.locator("[data-size-chip]")).toHaveText("L");
  await card
    .getByRole("button", { name: "Widget actions for Active records" })
    .click();
  await page
    .getByRole("menuitem", { name: "Hide widget", exact: true })
    .click();
  await expect(card).toHaveCount(0);
  await expect(dashboard.locator(".sui-dashboard-editor")).toBeFocused();
  await dashboard.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    dashboard.locator('[data-dashboard-widget="active"]'),
  ).toHaveAttribute("data-size", "S");
  await dashboard.getByRole("button", { name: "Customize dashboard" }).click();
  await card
    .getByRole("button", { name: "Widget actions for Active records" })
    .click();
  await page
    .getByRole("menuitem", { name: "Hide widget", exact: true })
    .click();
  await dashboard.getByRole("button", { name: "Save layout" }).click();
  await expect(
    dashboard.getByRole("button", { name: "Customize dashboard" }),
  ).toBeFocused();
  await page.reload();
  await expect(
    dashboard.locator('[data-dashboard-widget="active"]'),
  ).toHaveCount(0);
  await dashboard.getByRole("combobox", { name: "Preview profile" }).click();
  await page.getByRole("option", { name: "Operations", exact: true }).click();
  await expect(
    dashboard.locator('[data-dashboard-widget="active"]'),
  ).toBeVisible();
  await dashboard.getByRole("combobox", { name: "Preview profile" }).click();
  await page.getByRole("option", { name: "Leadership", exact: true }).click();
  await expect(
    dashboard.locator('[data-dashboard-widget="active"]'),
  ).toHaveCount(0);
  await dashboard.getByRole("button", { name: "Customize dashboard" }).click();
  await dashboard.getByRole("button", { name: "Widget catalog" }).click();
  const catalog = page.getByRole("dialog", {
    name: "Widget catalog",
    exact: true,
  });
  await catalog
    .getByText("Active records", { exact: true })
    .locator("..")
    .locator("..")
    .getByRole("button", { name: "Show" })
    .click();
  await page.keyboard.press("Escape");
  await dashboard.getByRole("button", { name: "Save layout" }).click();
  await expect(
    dashboard.locator('[data-dashboard-widget="active"]'),
  ).toBeVisible();
});

test("dashboard editor retains accessible responsive geometry and original icons", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#dashboard");
  const dashboard = page.locator("#dashboard");
  await expect(dashboard.locator(".sui-chart-value-plot").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  const records = dashboard.getByRole("region", {
    name: "Fixed records",
    exact: true,
  });
  const recordsNode = await records.elementHandle();
  await dashboard.getByRole("button", { name: "Customize dashboard" }).click();
  expect(await recordsNode!.evaluate((node) => node.isConnected)).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const icons = dashboard.locator(".sui-dashboard-editor img");
  for (const bounds of await icons.evaluateAll((images) =>
    images.map((image) => ({
      width: image.getBoundingClientRect().width,
      height: image.getBoundingClientRect().height,
      intrinsicWidth: (image as HTMLImageElement).naturalWidth,
      intrinsicHeight: (image as HTMLImageElement).naturalHeight,
    })),
  )) {
    expect([16, 20]).toContain(bounds.intrinsicWidth);
    expect(bounds.width).toBe(bounds.intrinsicWidth);
    expect(bounds.height).toBe(bounds.intrinsicHeight);
  }
  const results = await new AxeBuilder({ page })
    .include("#dashboard")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await dashboard
    .locator(".sui-dashboard-editor")
    .screenshot({ path: info.outputPath("dashboard-editor.png") });
  await dashboard.getByRole("button", { name: "Cancel", exact: true }).click();
  await dashboard
    .locator(".sui-dashboard")
    .screenshot({ path: info.outputPath("dashboard-preview.png") });
});

test("pointer dragging reorders cards and Escape cancels a drag", async ({
  page,
}) => {
  // Pointer events cover mouse and touch; explicit controls remain available on every viewport.
  await page.goto("/#dashboard");
  const dashboard = page.locator("#dashboard");
  await dashboard.getByRole("button", { name: "Customize dashboard" }).click();
  const handle = dashboard.getByRole("button", {
    name: "Drag Milestones complete",
  });
  const target = dashboard.getByRole("group", {
    name: "Active records",
    exact: true,
  });
  // Keep both cards away from edge auto-scroll while measuring this reorder gesture.
  await handle.evaluate((element) =>
    element.scrollIntoView({ block: "center" }),
  );
  const start = await handle.boundingBox();
  await page.mouse.move(start!.x + 8, start!.y + 8);
  await page.mouse.down();
  const end = await revealDropTarget(page, target, (x, y) =>
    page.mouse.move(x, y, { steps: 4 }),
  );
  await page.mouse.move(end.x + 40, end.y + 16, { steps: 10 });
  await page.mouse.up();
  await expect(
    dashboard
      .getByRole("region", { name: "Summary editor zone" })
      .getByRole("group")
      .first(),
  ).toHaveAttribute("aria-label", "Milestones complete");
  const again = await handle.boundingBox();
  await page.mouse.move(again!.x + 8, again!.y + 8);
  await page.mouse.down();
  await page.mouse.move(again!.x + 40, again!.y + 40, { steps: 3 });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(
    dashboard.locator('.sui-dashboard-editor [role="status"]'),
  ).toHaveText("Move cancelled. Layout unchanged.");
  await dashboard.getByRole("button", { name: "Save layout" }).click();
  await page.reload();
  await expect(
    dashboard
      .getByRole("region", { name: "Summary widgets" })
      .locator("[data-dashboard-widget]")
      .first(),
  ).toHaveAttribute("data-dashboard-widget", "milestones");
});

test("edit mode drags the actual chart, preserves its data and cancels drops outside the dashboard", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#dashboard");
  const dashboard = page.locator("#dashboard");
  await expect(dashboard.getByRole("button", { name: /^Drag / })).toHaveCount(
    0,
  );
  await dashboard.getByRole("button", { name: "Customize dashboard" }).click();
  const card = dashboard.getByRole("group", {
    name: "Created records",
    exact: true,
  });
  const plot = card.locator(".sui-chart-value-plot");
  await expect(card.getByRole("figure")).toBeVisible();
  await expect(card.getByRole("table")).toHaveCount(1);
  await plot.evaluate((node) => {
    const animation = node.getAnimations()[0];
    animation.id = "original-plot";
    animation.finish();
  });
  const handle = card.getByRole("button", {
    name: "Drag Created records",
    exact: true,
  });
  await handle.evaluate((node) => {
    node.scrollIntoView({ block: "center" });
  });
  const start = (await handle.boundingBox())!;
  await page.mouse.move(start.x + 12, start.y + 12);
  await page.mouse.down();
  await page.mouse.move(start.x + 60, start.y + 64, { steps: 6 });
  await expect(card).toHaveAttribute("data-dragging", "true");
  await expect(card.locator(".sui-dashboard-live-card")).not.toHaveCSS(
    "transform",
    "none",
  );
  expect(await plot.evaluate((node) => node.getAnimations()[0].id)).toBe(
    "original-plot",
  );
  await expect(card.getByRole("figure")).toHaveCount(1);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: info.outputPath("dashboard-dragging.png") });
  await page.mouse.move(0, 120, { steps: 4 });
  await page.mouse.up();
  await expect(card).not.toHaveAttribute("data-dragging", "true");
  await expect(card.locator(".sui-dashboard-live-card")).toHaveCSS(
    "transform",
    "none",
  );
  await expect(
    dashboard.locator('.sui-dashboard-editor [role="status"]'),
  ).toHaveText("Move cancelled. Layout unchanged.");
  await expect(
    dashboard
      .getByRole("region", { name: "Analysis editor zone" })
      .getByRole("group")
      .first(),
  ).toHaveAttribute("aria-label", "Created records");
});

test("pointer movement transfers a widget between zones, including touch input", async ({
  page,
}, info) => {
  await page.goto("/#dashboard");
  const dashboard = page.locator("#dashboard");
  await dashboard.getByRole("button", { name: "Customize dashboard" }).click();
  const title = "Created in September";
  const handle = dashboard.getByRole("button", {
    name: `Drag ${title}`,
    exact: true,
  });
  await handle.evaluate((node) => {
    node.scrollIntoView({ block: "center" });
  });
  const start = (await handle.boundingBox())!;
  const zone = dashboard.getByRole("region", { name: "Analysis editor zone" });
  const destination = zone.getByRole("heading", {
    name: "Analysis",
    exact: true,
  });
  const from = { x: start.x + 8, y: start.y + 8 };
  if (info.project.name === "mobile") {
    const client = await page.context().newCDPSession(page);
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ ...from, id: 1 }],
    });
    const move = async (x: number, y: number) => {
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x, y, id: 1 }],
      });
    };
    const to = await revealDropTarget(page, destination, move);
    await move(to.x + 40, to.y + 8);
    await client.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await client.detach();
  } else {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    const to = await revealDropTarget(page, destination, (x, y) =>
      page.mouse.move(x, y, { steps: 4 }),
    );
    await page.mouse.move(to.x + 40, to.y + 8, { steps: 10 });
    await page.mouse.up();
  }
  await expect(
    zone.getByRole("group", { name: title, exact: true }),
  ).toBeVisible();
  await expect(handle).toBeFocused();
});

test("storage failure is explicit and applied layout remains usable for the session", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key.startsWith("sui:dashboard:"))
        throw new DOMException("Storage unavailable", "QuotaExceededError");
      original.call(this, key, value);
    };
  });
  await page.goto("/#dashboard");
  const dashboard = page.locator("#dashboard");
  await dashboard.getByRole("button", { name: "Customize dashboard" }).click();
  const card = dashboard.getByRole("group", {
    name: "Active records",
    exact: true,
  });
  await card.getByRole("button", { name: "Settings" }).click();
  const settings = page.getByRole("dialog", {
    name: "Active records settings",
  });
  await settings.getByRole("radio", { name: "Large (L)" }).check();
  await settings.getByRole("button", { name: "Apply size" }).click();
  await dashboard.getByRole("button", { name: "Save layout" }).click();
  await expect(
    dashboard.locator('[data-dashboard-widget="active"]'),
  ).toHaveAttribute("data-size", "L");
  await expect(
    dashboard.getByText(/Browser storage is unavailable/),
  ).toBeVisible();
  await page.reload();
  await expect(
    dashboard.locator('[data-dashboard-widget="active"]'),
  ).toHaveAttribute("data-size", "S");
});

test("live editor retains the dashboard grid and meaningful size spans", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "desktop",
    "Wide layout is a desktop composition.",
  );
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto("/#dashboard");
  const dashboard = page.locator("#dashboard");
  await dashboard.getByRole("button", { name: "Customize dashboard" }).click();
  expect(
    await dashboard
      .locator(".sui-dashboard-canvas .sui-dashboard-grid")
      .first()
      .evaluate(
        (node) => getComputedStyle(node).gridTemplateColumns.split(" ").length,
      ),
  ).toBe(3);
  await dashboard
    .locator(".sui-dashboard-editor")
    .screenshot({ path: info.outputPath("dashboard-editor-wide.png") });
  await dashboard.getByRole("button", { name: "Cancel", exact: true }).click();
  const small = dashboard.locator('[data-dashboard-widget="active"]');
  const medium = dashboard.locator('[data-dashboard-widget="line"]');
  expect((await medium.boundingBox())!.width).toBeGreaterThan(
    (await small.boundingBox())!.width * 1.9,
  );
});

/** Hold the pointer at an edge until an offscreen destination clears the sticky save bar. */
async function revealDropTarget(
  page: Page,
  target: Locator,
  move: (x: number, y: number) => Promise<unknown>,
) {
  const viewport = (await page
    .locator(".docs-main > [data-sui-scroll-viewport]")
    .boundingBox())!;
  const footer = await page.locator(".sui-dashboard-save-bar").boundingBox();
  const bottom = Math.min(viewport.y + viewport.height, footer?.y ?? Infinity);
  const initial = (await target.boundingBox())!;
  if (initial.y + 16 < viewport.y + 64) {
    await move(viewport.x + 40, viewport.y + 16);
    await expect
      .poll(async () => (await target.boundingBox())!.y + 16)
      .toBeGreaterThan(viewport.y + 80);
  } else if (initial.y + 16 > bottom - 40) {
    await move(viewport.x + 40, viewport.y + viewport.height - 16);
    await expect
      .poll(async () => (await target.boundingBox())!.y + 16)
      .toBeLessThan(bottom - 64);
  }
  // Leave the edge before measuring the final drop position; scrolling continues while held.
  await move(viewport.x + 40, (viewport.y + bottom) / 2);
  await page.evaluate(() => new Promise(requestAnimationFrame));
  return (await target.boundingBox())!;
}
