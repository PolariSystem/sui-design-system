import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("recovery advances through inbox and reset without restarting the paused background", async ({
  page,
}) => {
  await page.goto("/?preview=signin");
  await page
    .getByRole("button", { name: "Pause background animation" })
    .click();
  const leaf = await page.locator(".sui-auth-leaf").elementHandle();
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(
    page.getByRole("heading", { name: "Forgot your password?" }),
  ).toBeFocused();
  await page.getByLabel("Work email").fill("reader@example.com");
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(
    page.getByRole("button", { name: "Sending link" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("heading", { name: "Check your inbox" }),
  ).toBeFocused();
  await expect(
    page.getByText(/If an account exists for reader@example.com/),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Resend email in/ }),
  ).toBeDisabled();
  await page.clock.install();
  await page.clock.fastForward(31_000);
  await page.getByRole("button", { name: "Resend email", exact: true }).click();
  await page.clock.fastForward(1500);
  await expect(
    page.getByRole("button", { name: /Resend email in/ }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Open demo reset link" }).click();
  await expect(
    page.getByRole("heading", { name: "Set a new password" }),
  ).toBeFocused();
  await page
    .getByLabel("New password", { exact: true })
    .fill("A long passphrase");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("Different passphrase");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(
    page.getByLabel("Confirm password", { exact: true }),
  ).toBeFocused();
  await expect(page.getByText("Passwords do not match.")).toBeVisible();
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("A long passphrase");
  await page.getByRole("button", { name: "Update password" }).click();
  await page.clock.fastForward(1500);
  await expect(
    page.getByRole("heading", { name: "Password updated" }),
  ).toBeFocused();
  expect(await leaf!.evaluate((node) => node.isConnected)).toBe(true);
  await expect(
    page.getByRole("button", { name: "Resume background animation" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to sign in" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
});

test("reset links expose expired and invalid recovery paths", async ({
  page,
}) => {
  await page.goto("/?step=reset-password#signinform");
  const section = page.locator("#signinform");
  for (const state of ["Expired", "Invalid"]) {
    await section.getByRole("combobox", { name: "Reset link status" }).click();
    await page.getByRole("option", { name: state + " link" }).click();
    await expect(
      section.getByText(
        state === "Expired"
          ? "This reset link has expired."
          : "This reset link is invalid.",
      ),
    ).toBeVisible();
    await expect(section.getByRole("form")).toHaveCount(0);
  }
  await section.getByRole("link", { name: "Request a new link" }).click();
  await expect(
    section.getByRole("heading", { name: "Forgot your password?" }),
  ).toBeFocused();
});

test("authenticator verification validates, handles rejection and retries without auto-submit", async ({
  page,
}) => {
  await page.goto("/?step=verify#signinform");
  const section = page.locator("#signinform");
  const form = section.getByRole("form", { name: "Two-step verification" });
  const code = form.getByLabel("Verification code");
  await form.getByRole("button", { name: "Verify and sign in" }).click();
  await expect(code).toBeFocused();
  await expect(code).toHaveAccessibleDescription("Enter all six digits.");
  await code.fill("012345");
  await expect(
    form.getByRole("button", { name: "Verify and sign in" }),
  ).toBeEnabled();
  await expect(
    section.getByText("Preview complete. No verification request was sent."),
  ).toHaveCount(0);
  await section.getByRole("combobox", { name: "Preview result" }).click();
  await page.getByRole("option", { name: "Rejected response" }).click();
  await code.press("Enter");
  await expect(
    form.getByRole("button", { name: "Verifying code" }),
  ).toBeDisabled();
  await expect(form.getByRole("alert")).toContainText(
    "Unable to verify this code.",
  );
  await expect(code).toHaveValue("012345");
  expect(
    (
      await new AxeBuilder({ page })
        .include("#signinform")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await section.getByRole("combobox", { name: "Preview result" }).click();
  await page.getByRole("option", { name: "Successful response" }).click();
  await code.press("Enter");
  await expect(
    section.getByText("Preview complete. No verification request was sent."),
  ).toBeVisible();
});

test("all recovery screens preserve approved geometry, original artwork and narrow accessible layouts", async ({
  page,
}, testInfo) => {
  const desktop = testInfo.project.name === "desktop";
  for (const step of [
    "forgot-password",
    "check-inbox",
    "reset-password",
    "password-updated",
    "verify",
  ]) {
    await page.setViewportSize(
      desktop ? { width: 1440, height: 1200 } : { width: 392, height: 940 },
    );
    await page.goto("/?preview=signin&step=" + step);
    await page.evaluate(() => document.fonts.ready);
    const card = page.locator(".sui-auth-card");
    const box = (await card.boundingBox())!;
    expect(box.width).toBe(desktop ? 448 : 352);
    expect(box.x + box.width / 2).toBeCloseTo(
      page.viewportSize()!.width / 2,
      1,
    );
    expect(box.y + box.height / 2).toBeCloseTo(
      page.viewportSize()!.height / 2,
      1,
    );
    await expect(card).toHaveCSS("padding", desktop ? "32px" : "16px");
    if (step === "password-updated") {
      const shield = card.locator("header img");
      await expect(shield).toHaveJSProperty("naturalWidth", 64);
      expect((await shield.boundingBox())!.width).toBe(64);
      expect((await shield.boundingBox())!.height).toBe(64);
    }
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(
      page.getByRole("button", { name: "Pause background animation" }),
    ).toHaveCount(0);
    await page.screenshot({
      path: testInfo.outputPath(step + ".png"),
      fullPage: true,
    });
    await page.setViewportSize({ width: 320, height: 640 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const actions = card.locator(".sui-auth-actions");
    if (await actions.count()) await expect(actions).toHaveCSS("gap", "8px");
  }
});
