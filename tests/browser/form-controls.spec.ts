import { test, expect } from "@playwright/test";

test("selection controls preserve keyboard navigation and visible focus", async ({
  page,
}) => {
  await page.goto("/#radio");
  const weekly = page.getByRole("radio", { name: "Weekly", exact: true });
  await weekly.focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("radio", { name: "Monthly", exact: true }),
  ).toBeChecked();
  await expect(weekly).not.toBeChecked();
  await expect(
    page
      .getByRole("radio", { name: "Monthly", exact: true })
      .locator("..")
      .locator(".sui-radio-focus"),
  ).toHaveCSS("opacity", "1");
  await page.goto("/#switch");
  const toggle = page.getByRole("switch", { name: "Email notifications" });
  await toggle.focus();
  await page.keyboard.press("Space");
  await expect(toggle).not.toBeChecked();
  await expect(toggle.locator("..")).toHaveCSS("outline-style", "solid");
  await page.goto("/#select");
  const select = page.getByRole("combobox", { name: "Record category" });
  await select.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(
    page.getByRole("option", { name: "Operations", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("option", { name: "Research", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(select).toHaveText("Research");
  await expect(select).toBeFocused();
  await expect(select).not.toHaveCSS("box-shadow", "none");
});

test("OTP supports paste, selection, incomplete validation and native reset", async ({
  page,
}) => {
  await page.goto("/#otpinput");
  const input = page.getByRole("textbox", { name: "Verification code" });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(input).toBeFocused();
  await expect(input).toHaveAccessibleDescription("Enter all six digits.");
  await input.evaluate((element) => {
    const clipboardData = new DataTransfer();
    clipboardData.setData("text/plain", "01 23-45");
    element.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await expect(input).toHaveValue("012345");
  await page.keyboard.press("Backspace");
  await expect(input).toHaveValue("01234");
  await page.keyboard.type("6");
  await expect(input).toHaveValue("012346");
  await page.keyboard.press("ControlOrMeta+A");
  await page.keyboard.type("009988");
  await expect(input).toHaveValue("009988");
  await expect(
    page.getByText(
      "Code captured in this preview. No verification request was sent.",
    ),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(
    page.getByText(
      "Code captured in this preview. No verification request was sent.",
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear code" }).click();
  await expect(input).toHaveValue("");
  const cells = input.locator("..").locator(".sui-otp-cell");
  await expect(cells).toHaveCount(6);
  const boxes = await cells.evaluateAll((elements) =>
    elements.map((element) => ({
      top: element.getBoundingClientRect().top,
      height: element.getBoundingClientRect().height,
    })),
  );
  expect(new Set(boxes.map((box) => box.top)).size).toBe(1);
  expect(boxes.every((box) => box.height >= 48)).toBe(true);
});

test("password visibility and multiline growth preserve form values and geometry", async ({
  page,
}) => {
  await page.goto("/#passwordinput");
  // Label text includes a decorative required marker; the accessible name excludes it.
  const password = page.getByLabel(/^New password/);
  await expect(password).toHaveAccessibleName("New password");
  const form = password.locator("xpath=ancestor::form");
  await password.fill("Long-example-password");
  const show = form.getByRole("button", { name: "Show password" });
  await show.focus();
  await page.keyboard.press("Enter");
  await expect(password).toHaveAttribute("type", "text");
  await expect(password).toHaveValue("Long-example-password");
  await expect(
    form.getByRole("button", { name: "Hide password" }),
  ).toBeFocused();
  await form.getByRole("button", { name: "Reset password preview" }).click();
  await expect(password).toHaveAttribute("type", "password");
  await expect(password).toHaveValue("");
  await page.goto("/#textarea");
  const notes = page.getByLabel("Workspace description", { exact: true });
  await notes.fill(
    "First line\nSecond line\nThird line\nFourth line\nFifth line\nSixth line",
  );
  const height = await notes.boundingBox();
  expect(height!.height).toBeGreaterThan(100);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("forced colors exposes native controls and readable OTP text", async ({
  page,
}) => {
  await page.goto("/#radio");
  await page.emulateMedia({ forcedColors: "active" });
  const radio = page.getByRole("radio", {
    name: "Selected option",
    exact: true,
  });
  await expect(radio).toHaveCSS("opacity", "1");
  await expect(radio.locator("..").locator("img").first()).toBeHidden();
  await page.goto("/#otpinput");
  const input = page.getByRole("textbox", { name: "Filled code" });
  await expect(input).not.toHaveCSS("color", "rgba(0, 0, 0, 0)");
  await input.focus();
  await page.keyboard.press("ArrowLeft");
  await expect(input).toHaveCSS("outline-style", "solid");
});
