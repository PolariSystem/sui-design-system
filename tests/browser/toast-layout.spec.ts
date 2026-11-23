import { expect, test } from "@playwright/test";

for (const theme of ["light", "dark"]) {
  test(`inline toast keeps its action at the right in ${theme}`, async ({
    page,
  }, info) => {
    await page.addInitScript(
      (mode) => localStorage.setItem("serenity-ui-theme", mode),
      theme,
    );
    if (info.project.name === "mobile")
      await page.setViewportSize({ width: 320, height: 740 });
    await page.goto("/#toast");
    const toast = page.locator('.sui-toast[data-layout="inline"]');
    await expect(toast).toBeVisible();
    await toast.scrollIntoViewIfNeeded();
    await expect(toast).toHaveCSS("opacity", "1");
    await expect(toast).toHaveCSS("border-radius", "12px");
    const message = (await toast.locator(".sui-toast-message").boundingBox())!;
    const button = toast.getByRole("button", { name: "Dismiss" });
    await expect(button).toHaveCSS("font-size", "14px");
    const action = (await button.boundingBox())!;
    const bounds = (await toast.boundingBox())!;
    expect(action.x - message.x - message.width).toBeCloseTo(16, 0);
    expect(action.x + action.width).toBeCloseTo(
      bounds.x + bounds.width - 17,
      0,
    );
    expect(action.y).toBeLessThan(message.y + message.height);
    expect(action.height).toBe(44);
    expect(
      await toast.evaluate((node) => node.scrollWidth <= node.clientWidth),
    ).toBe(true);
    await toast.screenshot({
      path: info.outputPath(`inline-toast-${theme}.png`),
    });

    // Translation and enlarged copy must wrap inside the reserved action column.
    await button.locator("span").evaluate((node) => {
      node.textContent = "Dismiss this notification";
    });
    expect(
      await toast.evaluate((node) => node.scrollWidth <= node.clientWidth),
    ).toBe(true);
    const wrapped = (await button.boundingBox())!;
    expect(wrapped.x).toBeGreaterThan(message.x);
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(toast).not.toBeVisible();
  });
}
