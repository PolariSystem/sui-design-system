import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("dialogs start with the safe action, contain focus and restore their trigger", async ({
  page,
}) => {
  await page.goto("/#dialog");
  const trigger = page
    .getByRole("button", { name: "Archive preview record" })
    .last();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Archive this record?" });
  await expect(
    dialog.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeFocused();
  // Cancel remains the safe initial focus; primary-first source order puts Archive before it.
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "Archive record", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog
    .getByRole("button", { name: "Archive record", exact: true })
    .click();
  await expect(
    page.locator("#dialog").getByText("Preview record archived."),
  ).toBeVisible();
});

test("drawer supports nested pickers, form submission and navigation dismissal", async ({
  page,
}) => {
  await page.goto("/#drawer");
  const trigger = page.getByRole("button", { name: "Open record panel" });
  await trigger.click();
  const drawer = page.getByRole("dialog", {
    name: "Record details",
    exact: true,
  });
  await drawer.getByRole("button", { name: "Due date", exact: true }).click();
  const picker = page.getByRole("dialog", { name: "Due date", exact: true });
  await picker
    .getByRole("button", { name: "Saturday, 17 October 2026", exact: true })
    .click();
  await picker.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(
    drawer.getByRole("button", { name: "Due date", exact: true }),
  ).toContainText("17 Oct 2026");
  await drawer
    .getByRole("textbox", { name: "Record name", exact: true })
    .fill("Quarterly review");
  await drawer
    .getByRole("button", { name: "Save record", exact: true })
    .click();
  await expect(drawer).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(
    page.getByText("Quarterly review saved in this preview."),
  ).toBeVisible();
  const navigation = page.getByRole("button", {
    name: "Open mobile navigation",
  });
  await navigation.click();
  await page
    .getByRole("dialog", { name: "Workspace navigation" })
    .getByRole("link", { name: "Records", exact: true })
    .click();
  await expect(navigation).toBeFocused();
});

test("action menus use keyboard navigation and interactive popovers retain actions", async ({
  page,
}) => {
  await page.goto("/#dropdownmenu");
  const trigger = page.getByRole("button", {
    name: "Record actions",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  const menu = page.getByRole("menu", { name: "Record actions" });
  await expect(
    menu.getByRole("menuitem", { name: "Edit record", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("d");
  await expect(
    menu.getByRole("menuitem", { name: "Duplicate record" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("A duplicate preview record was created."),
  ).toBeVisible();
  await expect(trigger).toBeFocused();
  await page.goto("/#popover");
  await page.getByRole("button", { name: "Show current location" }).click();
  const popover = page.getByRole("dialog", {
    name: "Current location",
    exact: true,
  });
  await popover.getByRole("button", { name: "Follow", exact: true }).click();
  await expect(
    popover.getByRole("button", { name: "Following" }),
  ).toHaveAttribute("aria-pressed", "true");
  await popover.getByRole("button", { name: "Details", exact: true }).click();
  await expect(popover).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Show current location" }),
  ).toBeFocused();
});

test("tooltip opens on keyboard focus and dismisses with Escape", async ({
  page,
}) => {
  await page.goto("/#tooltip");
  const action = page.getByRole("button", { name: "Archive help" });
  await action.focus();
  await expect(page.getByRole("tooltip")).toHaveText(
    "Archive a record without deleting it",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).not.toBeVisible();
  await expect(action).toBeFocused();
});

test("date selection is provisional, respects unavailable days and submits ISO values", async ({
  page,
}) => {
  await page.goto("/#datepicker");
  const field = page.getByRole("button", { name: "Review date", exact: true });
  await field.click();
  const picker = page.getByRole("dialog", { name: "Review date", exact: true });
  await picker
    .getByRole("button", { name: "Friday, 16 October 2026", exact: true })
    .click();
  await page.keyboard.press("Escape");
  await expect(field).toContainText("15 Oct 2026");
  await expect(field).toBeFocused();
  await field.click();
  const day = picker.getByRole("button", {
    name: "Thursday, 15 October 2026",
    exact: true,
  });
  await day.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    picker.getByRole("button", {
      name: "Friday, 16 October 2026",
      exact: true,
    }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await picker.getByRole("button", { name: "Apply", exact: true }).click();
  await page.getByRole("button", { name: "Save dates", exact: true }).click();
  await expect(
    page.getByText("Preview values: 2026-10-16; 2026-10-12 to 2026-10-16."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Restricted date", exact: true })
    .click();
  await expect(
    page
      .getByRole("dialog", { name: "Restricted date", exact: true })
      .getByRole("button", { name: "Saturday, 17 October 2026", exact: true }),
  ).toHaveAttribute("aria-disabled", "true");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Reset dates", exact: true }).click();
  await expect(field).toContainText("15 Oct 2026");
});

test("date range requires both endpoints and empty required dates block submission", async ({
  page,
}) => {
  await page.goto("/#datepicker");
  await page
    .getByRole("button", { name: "Reporting period", exact: true })
    .click();
  const picker = page.getByRole("dialog", {
    name: "Reporting period",
    exact: true,
  });
  await picker
    .getByRole("button", { name: "Monday, 19 October 2026", exact: true })
    .click();
  await expect(
    picker.getByRole("button", { name: "Apply", exact: true }),
  ).toBeDisabled();
  await picker
    .getByRole("button", { name: "Wednesday, 21 October 2026", exact: true })
    .click();
  await picker.getByRole("button", { name: "Apply", exact: true }).click();
  await page.getByRole("button", { name: "Save dates", exact: true }).click();
  await expect(
    page.getByText("Preview values: 2026-10-15; 2026-10-19 to 2026-10-21."),
  ).toBeVisible();
  const field = page.getByRole("button", { name: "Review date", exact: true });
  await field.click();
  const single = page.getByRole("dialog", { name: "Review date", exact: true });
  await single.getByRole("button", { name: "Clear", exact: true }).click();
  await single.getByRole("button", { name: "Apply", exact: true }).click();
  await page.getByRole("button", { name: "Save dates", exact: true }).click();
  await expect(field).toBeFocused();
  expect(
    await page
      .locator('input[name="date"]')
      .evaluate((input: HTMLInputElement) => input.validity.valueMissing),
  ).toBe(true);
});

test("time picker covers midnight, noon, limits, cancellation and native reset", async ({
  page,
}) => {
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
  await picker.getByRole("slider", { name: "Hour" }).press("End");
  await page.keyboard.press("Enter");
  await expect(picker.getByRole("slider", { name: "Minute" })).toBeFocused();
  await page.keyboard.press("Home");
  await picker.getByRole("button", { name: "Apply", exact: true }).click();
  await expect(field).toContainText("12:00 AM");
  await page.getByRole("button", { name: "Save times", exact: true }).click();
  await expect(page.getByText("Preview times: 00:00, 14:00.")).toBeVisible();
  await field.click();
  await picker.getByRole("button", { name: "PM", exact: true }).click();
  await picker.getByRole("button", { name: "Apply", exact: true }).click();
  await page.getByRole("button", { name: "Save times", exact: true }).click();
  await expect(page.getByText("Preview times: 12:00, 14:00.")).toBeVisible();
  await field.click();
  await picker.getByRole("slider", { name: "Hour" }).press("ArrowDown");
  await picker.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(field).toContainText("12:00 PM");
  await page
    .getByRole("button", { name: "Reminder time", exact: true })
    .click();
  const reminder = page.getByRole("dialog", {
    name: "Reminder time",
    exact: true,
  });
  await expect(
    reminder.locator('.sui-clock-label[data-value="7"]'),
  ).toHaveAttribute("data-disabled", "true");
  await reminder.getByRole("button", { name: "Cancel", exact: true }).click();
  await page.getByRole("button", { name: "Reset times", exact: true }).click();
  await expect(field).toContainText("09:30 AM");
});

test("weekly calendar opens event details and restores the actual event trigger", async ({
  page,
}) => {
  await page.goto("/#calendar");
  const planner = page.getByRole("region", {
    name: "Planner example",
    exact: true,
  });
  const event = planner.getByRole("button", { name: /^Weekly planning,/ });
  await event.click();
  await expect(
    page.getByRole("dialog", { name: "Weekly planning", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(event).toBeFocused();
  await page.getByRole("button", { name: "Next week", exact: true }).click();
  await expect(planner.getByRole("button")).toHaveCount(0);
});

test("calendar grows into an agenda when enlarged text would overlap", async ({
  page,
}) => {
  await page.goto("/#calendar");
  await page.setViewportSize({ width: 1280, height: 900 });
  const planner = page.getByRole("region", {
    name: "Planner example",
    exact: true,
  });
  await expect(planner).toHaveAttribute("data-agenda", "false");
  await page.addStyleTag({
    content:
      ".sui-calendar-event .text-sui-calendar-title { font-size:48px; line-height:1.5; }",
  });
  await expect(planner).toHaveAttribute("data-agenda", "true");
  await expect(planner.getByRole("button")).toHaveCount(10);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("open surfaces fit narrow screens, honor reduced motion and pass accessibility checks", async ({
  page,
}, testInfo) => {
  test.setTimeout(90000);
  await page.goto("/");
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [trigger, title] of [
    ["Review date", "Review date"],
    ["Meeting start", "Meeting start"],
    ["Open record panel", "Record details"],
    ["Open notification panel", "Notification"],
  ]) {
    await page.goto(
      trigger === "Review date"
        ? "/#datepicker"
        : trigger === "Meeting start"
          ? "/#timepicker"
          : "/#drawer",
    );
    await page.getByRole("button", { name: trigger, exact: true }).click();
    const surface = page.getByRole("dialog", { name: title, exact: true });
    await expect(surface).toBeVisible();
    const box = (await surface.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(320);
    await expect(surface).toHaveCSS("animation-name", "none");
    expect(
      await surface.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    const audit = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(audit.violations).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`${trigger.replaceAll(" ", "-")}.png`),
    });
    await page.keyboard.press("Escape");
    await expect(surface).not.toBeVisible();
  }
});
