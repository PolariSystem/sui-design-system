import { test, expect } from "@playwright/test";

test("card variants share the approved padding and preserve content rhythm", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#card");
  const cards = page.locator("#card .sui-card");
  await expect(cards).toHaveCount(3);
  for (const card of await cards.all()) {
    for (const side of ["top", "right", "bottom", "left"]) {
      await expect(card).toHaveCSS(`padding-${side}`, "16px");
    }
  }
  await expect(cards.first()).toHaveCSS("gap", "8px");
  await expect(cards.last()).toHaveCSS("gap", "16px");
  await expect(page.locator("#card > div").first()).toHaveCSS(
    "margin-bottom",
    "16px",
  );
});

test("mobile dashboard actions preserve primary-first visual and keyboard order", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "The mobile footer is hidden on desktop.");
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 639]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/#dashboard");
    await page.getByRole("button", { name: "Customize dashboard" }).click();
    const footer = page.locator(".sui-dashboard-save-bar");
    const save = footer.getByRole("button", { name: "Save layout" });
    const cancel = footer.getByRole("button", { name: "Cancel", exact: true });
    await save.scrollIntoViewIfNeeded();
    const [saveBox, cancelBox, footerBox] = await Promise.all([
      save.boundingBox(),
      cancel.boundingBox(),
      footer.boundingBox(),
    ]);
    expect(saveBox).not.toBeNull();
    expect(cancelBox).not.toBeNull();
    expect(footerBox).not.toBeNull();
    expect(cancelBox!.y - (saveBox!.y + saveBox!.height)).toBeCloseTo(8, 1);
    expect(saveBox!.x).toBeCloseTo(footerBox!.x + 16, 1);
    expect(saveBox!.width).toBeCloseTo(footerBox!.width - 32, 1);
    expect(cancelBox!.x).toBeCloseTo(saveBox!.x, 1);
    expect(cancelBox!.width).toBeCloseTo(saveBox!.width, 1);
    await save.focus();
    await page.keyboard.press("Tab");
    await expect(cancel).toBeFocused();
    await cancel.click();
  }
});
