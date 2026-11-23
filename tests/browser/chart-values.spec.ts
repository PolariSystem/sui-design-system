import { test, expect } from "@playwright/test";

test("all chart values start at zero, interpolate against fixed scales and finish exactly", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/#chart");
  const plots = page.locator("#chart .sui-chart-value-plot");
  const tables = await page.locator("#chart table").allTextContents();
  const axes = await page.locator("#chart .sui-chart-y-axis").allTextContents();
  // Replay each catalog example, then seek its native clock rather than depending on CPU speed.
  await page.evaluate(async () => {
    document
      .querySelectorAll<HTMLButtonElement>('[aria-label^="Replay values for "]')
      .forEach((button) => button.click());
    await new Promise(requestAnimationFrame);
    document
      .querySelectorAll("#chart .sui-chart-value-plot")
      .forEach((plot) => {
        plot.getAnimations().forEach((animation) => {
          animation.pause();
          animation.effect!.updateTiming({ easing: "linear" });
          animation.currentTime = 0;
        });
      });
  });
  const metric = page.locator("#chart .text-sui-chart-metric");
  await expect(metric).toHaveText("0");
  await expect(
    page.locator("#chart .sui-chart-column-value").first(),
  ).toHaveText("0");
  await expect(
    page.locator("#chart .sui-chart-stack > span").first(),
  ).toHaveCSS("width", "0px");
  const ring = page
    .locator("#chart .sui-chart-ring circle[pathLength]")
    .first();
  await expect(ring).toHaveAttribute("stroke-dasharray", "0 100");
  expect(await page.locator("#chart table").allTextContents()).toEqual(tables);
  expect(
    await page.locator("#chart .sui-chart-y-axis").allTextContents(),
  ).toEqual(axes);
  const figure = page.getByRole("figure", {
    name: "Weekly throughput",
    exact: true,
  });
  const baseline = await figure.boundingBox();

  await page.evaluate(() => {
    document
      .querySelectorAll("#chart .sui-chart-value-plot")
      .forEach((plot) => {
        plot.getAnimations().forEach((animation) => {
          animation.currentTime =
            Number(animation.effect!.getTiming().duration) / 2;
        });
      });
  });
  await expect(metric).toHaveText("624");
  // The catalog contains twelve chart kinds; the final plot is a separate usage example.
  for (const plot of (await plots.all()).slice(0, 12))
    await expect(plot).toHaveAttribute("data-progress", "0.5");
  await expect(figure.locator(".sui-chart-column-value").first()).toHaveText(
    "9",
  );
  await expect(ring).toHaveAttribute("stroke-dasharray", "30 70");
  await expect(
    page
      .getByRole("figure", { name: "Quarterly goal", exact: true })
      .locator(".text-sui-chart-goal"),
  ).toHaveText("36 / 100");
  const line = page.getByRole("figure", {
    name: "Created records",
    exact: true,
  });
  expect(
    await line
      .locator(".sui-chart-point")
      .first()
      .evaluate((element) => (element as HTMLElement).style.top),
  ).toBe("75%");
  await expect(
    page
      .getByRole("figure", { name: "Team activity", exact: true })
      .locator(".sui-chart-heatcell")
      .first(),
  ).toHaveText("1");
  expect(
    await page
      .locator("#chart .sui-chart-stack > span")
      .first()
      .evaluate((element) => (element as HTMLElement).style.width),
  ).toBe("30%");
  expect(await page.locator("#chart table").allTextContents()).toEqual(tables);
  expect((await figure.boundingBox())!.height).toBeCloseTo(baseline!.height, 1);
  await figure.screenshot({ path: info.outputPath("columns-half-values.png") });

  await page.evaluate(() =>
    document
      .querySelectorAll("#chart .sui-chart-value-plot")
      .forEach((plot) =>
        plot.getAnimations().forEach((animation) => animation.finish()),
      ),
  );
  await expect(metric).toHaveText("1,248");
  await expect(figure.locator(".sui-chart-column-value").first()).toHaveText(
    "18",
  );
  await expect(ring).toHaveAttribute("stroke-dasharray", "60 40");
  expect(await page.locator("#chart table").allTextContents()).toEqual(tables);
  for (const plot of await plots.all())
    await expect(plot).toHaveAttribute("data-progress", "1");
  await figure.screenshot({
    path: info.outputPath("columns-final-values.png"),
  });
  await page
    .getByRole("button", { name: "Replay values for Metric", exact: true })
    .click();
  await page.evaluate(() => {
    window.location.hash = "button";
  });
  await expect(page.locator("#button")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((animation) => animation.id === "sui-chart-values").length,
    ),
  ).toBe(0);
});
