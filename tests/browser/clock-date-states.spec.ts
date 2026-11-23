import { test, expect, type Page, type Locator } from "@playwright/test";

async function chooseMark(
  page: Page,
  picker: Locator,
  value: number,
  touch = false,
) {
  // Coordinate interactions need the opening surface to finish moving first.
  await picker.getByRole("slider").click({ trial: true });
  const box = (await picker
    .locator(`.sui-clock-label[data-value="${value}"]`)
    .boundingBox())!;
  if (touch)
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  else await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

test("clock chooses hours then minutes, switches format without changing time and supports exact minutes", async ({
  page,
}, info) => {
  await page.goto("/#timepicker");
  const field = page.getByRole("button", {
    name: "Meeting start",
    exact: true,
  });
  await field.click();
  const picker = page.getByRole("dialog", {
    name: "Meeting start",
    exact: true,
  });
  await chooseMark(page, picker, 11, info.project.name === "mobile");
  await expect(picker.getByRole("slider", { name: "Minute" })).toBeFocused();
  await chooseMark(page, picker, 5, info.project.name === "mobile");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(picker.getByRole("slider", { name: "Minute" })).toHaveAttribute(
    "aria-valuenow",
    "7",
  );
  await picker.getByRole("button", { name: "PM", exact: true }).click();
  await picker.getByRole("button", { name: "24-hour format" }).click();
  await expect(picker.getByRole("button", { name: "Choose hours" })).toHaveText(
    "23",
  );
  await picker.getByRole("button", { name: "Choose hours" }).click();
  await chooseMark(page, picker, 0, info.project.name === "mobile");
  await expect(picker.getByRole("slider", { name: "Minute" })).toBeFocused();
  await picker.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(field).toContainText("00:07");
  await page.getByRole("button", { name: "Save times", exact: true }).click();
  await expect(page.getByText("Preview times: 00:07, 14:00.")).toBeVisible();
});

test("clock drag respects intervals and unavailable hours without committing on cancellation", async ({
  page,
}) => {
  await page.goto("/#timepicker");
  const field = page.getByRole("button", {
    name: "Reminder time",
    exact: true,
  });
  await field.click();
  const picker = page.getByRole("dialog", {
    name: "Reminder time",
    exact: true,
  });
  await chooseMark(page, picker, 7);
  await expect(picker.getByRole("slider", { name: "Hour" })).toHaveAttribute(
    "aria-valuenow",
    "14",
  );
  await chooseMark(page, picker, 16);
  const dial = picker.getByRole("slider", { name: "Minute" });
  const box = (await dial.boundingBox())!;
  const x = box.x + box.width / 2,
    y = box.y + box.height / 2,
    r = (box.width * 104) / 256;
  await page.mouse.move(x, y - r);
  await page.mouse.down();
  await page.mouse.move(x + r, y, { steps: 6 });
  await page.mouse.up();
  await expect(dial).toHaveAttribute("aria-valuenow", "15");
  await page.keyboard.press("ArrowRight");
  await expect(dial).toHaveAttribute("aria-valuenow", "30");
  await picker.getByRole("button", { name: "Choose hours" }).click();
  const hours = picker.getByRole("slider", { name: "Hour" });
  await hours.click({ trial: true });
  const limit = (await picker
    .locator('.sui-clock-label[data-value="18"]')
    .boundingBox())!;
  await page.mouse.move(limit.x + limit.width / 2, limit.y + limit.height / 2);
  await page.mouse.down();
  await expect(
    picker.getByRole("button", { name: "Choose minutes" }),
  ).toHaveText("00");
  // Simulate the browser cancelling a captured gesture, such as an interrupted touch.
  await hours.dispatchEvent("pointercancel", { pointerId: 1, isPrimary: true });
  await page.mouse.up();
  await expect(hours).toHaveAttribute("aria-valuenow", "16");
  await expect(
    picker.getByRole("button", { name: "Choose minutes" }),
  ).toHaveText("30");
  await picker.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(field).toContainText("14:00");
});

test("single selections and range endpoints retain Button hover and pressed colors", async ({
  page,
}) => {
  await page.goto("/#button");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const primary = page.getByRole("button", { name: "Primary", exact: true });
  await primary.hover();
  const hover = await primary.evaluate(
    (e) => getComputedStyle(e).backgroundColor,
  );
  const foreground = await primary.evaluate((e) => getComputedStyle(e).color);
  await page.mouse.down();
  const pressed = await primary.evaluate(
    (e) => getComputedStyle(e).backgroundColor,
  );
  await page.mouse.up();
  await page.goto("/#datepicker");
  for (const [field, dates] of [
    ["Review date", ["2026-10-15"]],
    ["Reporting period", ["2026-10-12", "2026-10-16"]],
  ] as const) {
    await page.getByRole("button", { name: field, exact: true }).click();
    const picker = page.getByRole("dialog", { name: field, exact: true });
    for (const date of dates) {
      const day = picker.locator(`[data-date="${date}"]`);
      await day.hover();
      await expect(day).toHaveCSS("background-color", hover);
      await expect(day).toHaveCSS("color", foreground);
      await page.mouse.down();
      await expect(day).toHaveCSS("background-color", pressed);
      await page.mouse.move(0, 0);
      await page.mouse.up();
    }
    await page.keyboard.press("Escape");
  }
});
