import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("table selection survives paging and sort, search and bulk actions work", async ({
  page,
}) => {
  await page.goto("/#datatable");
  const table = page.locator("#datatable").getByRole("table", {
    name: "Workspace records",
    exact: true,
  });
  await table
    .getByRole("checkbox", { name: "Select Workspace onboarding" })
    .check();
  const all = table.getByRole("checkbox", {
    name: "Select all rows on this page",
  });
  await expect(all).toBeChecked({ indeterminate: true });
  await all.check();
  const pagination = page.locator("#datatable").getByRole("navigation", {
    name: "Workspace records pagination",
  });
  await pagination.getByRole("button", { name: "Next", exact: true }).click();
  await table
    .getByRole("checkbox", { name: "Select Resource allocation" })
    .check();
  await pagination
    .getByRole("button", { name: "Previous", exact: true })
    .click();
  await expect(
    table.getByRole("checkbox", { name: "Select Workspace onboarding" }),
  ).toBeChecked();
  await table.getByRole("button", { name: "Sort by Record name" }).click();
  await expect(
    table.getByRole("columnheader", { name: /Record name/ }),
  ).toHaveAttribute("aria-sort", "ascending");
  await expect(table.locator("tbody tr").first()).toContainText(
    "Access policy update",
  );
  await page
    .locator("#datatable")
    .getByRole("button", { name: "Mark selected completed", exact: true })
    .click();
  await page
    .locator("#datatable")
    .getByRole("textbox", { name: "Search records" })
    .fill("Workspace");
  await expect(table.locator("tbody tr")).toHaveCount(1);
  await expect(table.locator("tbody tr")).toContainText("Completed");
  await page
    .locator("#datatable")
    .getByRole("button", { name: "Clear selection", exact: true })
    .click();
  await expect(
    table.getByRole("checkbox", { name: "Select Workspace onboarding" }),
  ).not.toBeChecked();
});

test("table exposes recovery states and row details restore focus", async ({
  page,
}) => {
  await page.goto("/#datatable");
  const table = page.locator("#datatable").getByRole("table", {
    name: "Workspace records",
    exact: true,
  });
  await page
    .locator("#datatable")
    .getByRole("button", { name: "Preview loading", exact: true })
    .click();
  await expect(table).toHaveAttribute("aria-busy", "true");
  await expect(
    table.getByRole("button", { name: "Sort by Record name" }),
  ).toBeDisabled();
  await page
    .locator("#datatable")
    .getByRole("button", { name: "Show records", exact: true })
    .click();
  await page
    .locator("#datatable")
    .getByRole("button", { name: "Preview error", exact: true })
    .click();
  await expect(table.getByRole("alert")).toContainText(
    "Records could not be loaded",
  );
  await page
    .locator("#datatable")
    .getByRole("button", { name: "Retry", exact: true })
    .click();
  await page
    .locator("#datatable")
    .getByRole("textbox", { name: "Search records" })
    .fill("missing record");
  await expect(
    page
      .locator("#datatable")
      .getByRole("heading", { name: "No matching records" }),
  ).toBeVisible();
  await page
    .locator("#datatable")
    .getByRole("button", { name: "Clear search", exact: true })
    .click();
  const trigger = table.getByRole("button", {
    name: "Actions for Workspace onboarding",
  });
  await trigger.click();
  await page
    .getByRole("menuitem", { name: "View record", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Workspace onboarding",
    exact: true,
  });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Close details" }).click();
  await expect(trigger).toBeFocused();
});

test("table preserves geometry, scrolls on narrow screens and passes accessibility", async ({
  page,
}, info) => {
  await page.goto("/#datatable");
  await page.evaluate(() => document.fonts.ready);
  const section = page.locator("#datatable");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    ),
  ).toBe(true);
  const viewport = page.locator("#datatable").getByRole("region", {
    name: "Records specimen table viewport",
    exact: true,
  });
  await viewport.focus();
  if (info.project.name === "mobile") {
    expect(await viewport.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(
      true,
    );
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => viewport.evaluate((e) => e.scrollLeft))
      .toBeGreaterThan(0);
  }
  const check = viewport.locator(".sui-checkmark").first();
  const checkBounds = (await check.boundingBox())!;
  // Browser transforms may retain subpixel noise after settling; the target remains 16 px.
  expect(checkBounds.width).toBeCloseTo(16, 3);
  expect(checkBounds.height).toBeCloseTo(16, 3);
  const more = viewport
    .locator(".sui-table-actions .sui-icon-button img")
    .first();
  expect(await more.boundingBox()).toMatchObject({ width: 20, height: 20 });
  const actionCell = viewport.locator("tbody tr").first().locator("td").last();
  await expect(actionCell.getByRole("button")).toHaveAttribute(
    "aria-label",
    "Actions for Workspace onboarding",
  );
  expect(await actionCell.getByRole("button").boundingBox()).toMatchObject({
    width: 40,
    height: 40,
  });
  await expect(
    viewport.locator("thead th").last().locator(".sr-only"),
  ).toHaveText("Actions");
  await expect(
    viewport.locator("tbody tr").first().locator("td").nth(5),
  ).toHaveText("High");
  // Assess final contrast after the shared content entrance has finished.
  await expect.poll(() => page.locator(".docs-page").evaluate(
    (element) => element.getAnimations().length,
  )).toBe(0);
  expect(
    (
      await new AxeBuilder({ page })
        .include("#datatable")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await section.screenshot({ path: info.outputPath("table.png") });
  await viewport.evaluate((element) => {
    element.scrollLeft = element.scrollWidth;
  });
  await viewport.screenshot({ path: info.outputPath("table-actions.png") });
});

test("graphic entrance animates once and reduced motion presents final data immediately", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#progress");
  const plot = page.locator(".sui-chart-appear").first();
  const animation = await plot.evaluate((e) => {
    const animation = e
      .getAnimations()
      .find(
        (a) =>
          a instanceof CSSAnimation && a.animationName === "sui-chart-appear",
      )!;
    animation.pause();
    animation.currentTime = 0;
    const result = {
      duration: animation.effect!.getTiming().duration,
      iterations: animation.effect!.getTiming().iterations,
      initial: getComputedStyle(e).opacity,
    };
    animation.finish();
    return result;
  });
  expect(animation).toEqual({ duration: 800, iterations: 1, initial: "0" });
  await expect(plot).toHaveCSS("opacity", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(plot).toHaveCSS("animation-name", "none");
  await expect(plot).toHaveCSS("transform", "none");
  await expect(plot).toHaveAttribute("role", "progressbar");
});
