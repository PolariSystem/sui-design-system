import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("documentation routes isolate content, preserve history and support searchable mobile navigation", async ({
  page,
}, info) => {
  await page.goto("/#button");
  await expect(page.locator(".workshop-section")).toHaveCount(1);
  await expect(page.locator("#button")).toBeVisible();
  await expect(page.locator("#input")).toHaveCount(0);
  const mobile = info.project.name === "mobile";
  if (mobile)
    await page.getByRole("button", { name: "Open Components index" }).click();
  const search = page
    .getByRole("searchbox", { name: "Search components" })
    .filter({ visible: true });
  await search.fill("switch");
  const navigation = page
    .getByRole("navigation", { name: "Component library index" })
    .filter({ visible: true });
  await expect(navigation.getByRole("link")).toHaveCount(1);
  await navigation.getByRole("link", { name: "Switch", exact: true }).click();
  await expect(page.locator("#switch")).toBeVisible();
  await expect(page.locator("#button")).toHaveCount(0);
  await expect(page.locator("#main")).toBeFocused();
  await page.goBack();
  await expect(page.locator("#button")).toBeVisible();
  await page.reload();
  await expect(page.locator("#button")).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Usage code example" }),
  ).toHaveCount(0);
  await expect(page.getByText("View code", { exact: true })).toHaveCount(0);
  await expect
    .poll(() =>
      page.locator(".docs-page").evaluate((el) => el.getAnimations().length),
    )
    .toBe(0);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: info.outputPath("docs-button.png"),
    fullPage: true,
  });
  await page.goto("/#motion");
  await page.getByRole("button", { name: "Play motion study" }).click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".docs-page")).toHaveCSS("animation-name", "none");
  await expect(page.locator(".motion-stage span").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.screenshot({
    path: info.outputPath("docs-motion.png"),
    fullPage: true,
  });
});

test("chart and widget replay preserve mounted content and keyboard focus", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  for (const route of ["chart", "widget"]) {
    await page.goto("/#" + route);
    const play = page
      .getByRole("button", { name: /^Replay values for / })
      .first();
    const plot = page.locator("#" + route + " .sui-chart-value-plot").first();
    const node = await plot.elementHandle();
    await play.focus();
    await page.keyboard.press("Enter");
    await expect(play).toBeFocused();
    expect(await node!.evaluate((element) => element.isConnected)).toBe(true);
    await expect(plot).toHaveCSS("opacity", "1");
    await expect(plot).toHaveCSS("transform", "none");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(plot).toHaveAttribute("data-progress", "1");
    await play.click();
    await expect(plot).toHaveAttribute("data-progress", "1");
    expect(
      await plot.evaluate((element) => element.getAnimations().length),
    ).toBe(0);
    await expect(play).toBeFocused();
    await page.emulateMedia({ reducedMotion: "no-preference" });
  }
});
