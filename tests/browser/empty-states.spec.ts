import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("empty tables keep recovery visible outside horizontal scrolling", async ({
  page,
}, info) => {
  await page.goto("/#datatable");
  await page
    .locator("#datatable")
    .getByRole("button", { name: "Preview empty", exact: true })
    .click();
  const empty = page.locator("#datatable").getByRole("region", {
    name: "Workspace records empty state",
  });
  await expect(
    empty.getByRole("heading", { name: "No records", exact: true }),
  ).toBeVisible();
  await expect(empty.getByRole("button")).toHaveCount(0);
  const table = page.locator("#datatable").getByRole("table", {
    name: "Workspace records",
    exact: true,
  });
  await expect(table).toHaveAccessibleDescription(/No records/);
  await expect(table.getByRole("checkbox")).toBeDisabled();
  const viewport = page.locator("#datatable").getByRole("region", {
    name: "Workspace records table viewport",
  });
  await viewport.evaluate((e) => {
    e.scrollLeft = e.scrollWidth;
  });
  const box = (await empty.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await expect(empty.locator(".sui-empty-state")).toHaveCSS(
    "box-shadow",
    "none",
  );
  await page
    .locator("#datatable")
    .getByRole("button", { name: "Show records", exact: true })
    .click();
  await expect(empty).toHaveCount(0);
  await page
    .locator("#datatable")
    .getByRole("textbox", { name: "Search records" })
    .fill("no matching record");
  await expect(
    empty.getByRole("heading", { name: "No matching records" }),
  ).toBeVisible();
  // Reveal the recovery action inside the bounded content panel.
  await empty
    .getByRole("button", { name: "Clear search" })
    .scrollIntoViewIfNeeded();
  await expect(
    empty.getByRole("button", { name: "Clear search" }),
  ).toBeInViewport();
  expect(
    (
      await new AxeBuilder({ page })
        .include("#datatable")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await empty.screenshot({ path: info.outputPath("table-empty.png") });
  await empty.getByRole("button", { name: "Clear search" }).click();
  await expect(table.locator("tbody tr")).toHaveCount(4);
});

test("illustrations load at their exported size and respect reduced motion", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#emptystate");
  const catalog = page.getByLabel("Empty-state illustration catalog");
  const images = catalog.locator("img");
  await expect(images).toHaveCount(13);
  await expect
    .poll(() =>
      images.evaluateAll((nodes) =>
        nodes.every((node) => {
          const image = node as HTMLImageElement;
          return (
            image.complete &&
            image.naturalWidth === 160 &&
            image.naturalHeight === 144
          );
        }),
      ),
    )
    .toBe(true);
  await expect(images.first()).toHaveCSS("animation-duration", "0.8s");
  await expect(images.first()).toHaveCSS("animation-iteration-count", "1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(images.first()).toHaveCSS("animation-name", "none");
  await expect(images.first()).toHaveCSS("opacity", "1");
  await expect(images.first()).toHaveCSS("transform", "none");
  await expect(catalog.getByRole("img")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await catalog.screenshot({
    path: info.outputPath("empty-state-catalog.png"),
  });
});
