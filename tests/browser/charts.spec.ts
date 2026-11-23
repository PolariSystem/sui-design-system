import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("chart controls preserve mounted content and apply ordinary data edits immediately", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#chart");
  const section = page.locator("#chart");
  await expect(section.getByRole("figure")).toHaveCount(13);
  const figure = section.getByRole("figure", {
    name: "Records by month",
    exact: true,
  });
  const plot = figure.locator(".sui-chart-value-plot");
  await plot.evaluate((element) => {
    const animation = element.getAnimations()[0];
    animation.id = "original-chart-entrance";
    animation.finish();
  });
  await section.getByRole("button", { name: "Show chart data" }).click();
  const table = figure.getByRole("table", { name: "Records by month data" });
  await expect(table).toBeVisible();
  await expect(
    table.getByRole("cell", { name: "220", exact: true }),
  ).toBeVisible();
  await section
    .getByRole("combobox", { name: "Reporting period", exact: true })
    .click();
  await page.getByRole("option", { name: "Previous period" }).click();
  await expect(
    table.getByRole("cell", { name: "194", exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole("cell", { name: "220", exact: true }),
  ).toHaveCount(0);
  await expect(plot).toHaveAttribute("data-progress", "1");
  expect(await plot.evaluate((element) => element.getAnimations().length)).toBe(
    0,
  );
  await section
    .getByRole("combobox", { name: "Chart type", exact: true })
    .click();
  await page.getByRole("option", { name: "Column", exact: true }).click();
  await expect(figure.locator(".sui-chart-column")).toHaveCount(6);
  await expect(plot).toHaveAttribute("data-progress", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(plot).toHaveCSS("animation-name", "none");
  await expect(plot).toHaveCSS("opacity", "1");
  await expect(plot).toHaveCSS("transform", "none");
});

test("widgets expose data menus, recovery and loading without stale charts", async ({
  page,
}) => {
  await page.goto("/#widget");
  const widget = page.getByRole("region", {
    name: "Workspace activity",
    exact: true,
  });
  const actions = widget.getByRole("button", {
    name: "Actions for Workspace activity",
  });
  await actions.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("menuitem", { name: "View data table" }).click();
  await expect(widget.getByRole("table")).toBeVisible();
  await expect(actions).toBeFocused();
  const section = page.locator("#widget");
  await section
    .getByRole("button", { name: "Preview loading", exact: true })
    .click();
  await expect(widget).toHaveAttribute("aria-busy", "true");
  await expect(widget.getByRole("figure")).toHaveCount(0);
  await expect(widget.getByRole("status")).toHaveText("Loading widget");
  await section
    .getByRole("button", { name: "Preview error", exact: true })
    .click();
  await expect(widget.getByRole("alert")).toHaveText(
    "Activity could not be loaded.",
  );
  await widget.getByRole("button", { name: "Retry activity" }).click();
  await expect(widget.getByRole("figure")).toBeVisible();
  await section
    .getByRole("button", { name: "Preview empty", exact: true })
    .click();
  await expect(
    widget.getByRole("heading", { name: "No data yet" }),
  ).toBeVisible();
  await expect(widget.getByRole("table")).toHaveCount(0);
});

test("charts and widgets retain readable geometry and accessible alternatives", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#chart");
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.locator("#chart .sui-chart-stack").first()).toHaveCSS(
    "border-radius",
    "4px",
  );
  await expect(page.locator("#chart .sui-chart-stack").first()).toHaveCSS(
    "overflow",
    "hidden",
  );
  const ring = page.locator("#chart .sui-chart-ring");
  expect(await ring.boundingBox()).toMatchObject({ width: 128, height: 128 });
  const fontSize = await page
    .locator("#chart .sui-chart-x-axis span")
    .first()
    .evaluate((e) => getComputedStyle(e).fontSize);
  expect(fontSize).toBe("10px");
  await page.goto("/#widget");
  const icon = page.locator("#widget .sui-widget button img").first();
  expect(await icon.boundingBox()).toMatchObject({ width: 20, height: 20 });
  expect(
    await icon.evaluate(
      (img: HTMLImageElement) => img.complete && img.naturalWidth === 20,
    ),
  ).toBe(true);
  for (const id of ["chart", "widget"]) {
    await page.goto(`/#${id}`);
    expect(
      (
        await new AxeBuilder({ page })
          .include(`#${id}`)
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page
      .locator(`#${id}`)
      .screenshot({ path: info.outputPath(`${id}.png`) });
  }
  await page.goto("/#chart");
  await page.setViewportSize({ width: 320, height: 640 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(
    page
      .locator("#chart")
      .getByRole("table", { name: "Effort vs cycle time data" }),
  ).toBeAttached();
});
