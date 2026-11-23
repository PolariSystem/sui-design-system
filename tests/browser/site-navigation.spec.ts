import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("skip navigation preserves the route and does not add history entries", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#button");
  const historyLength = await page.evaluate(() => history.length);
  const skip = page.getByRole("link", { name: "Skip to content" });
  for (let attempt = 0; attempt < 2; attempt++) {
    await skip.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
    await expect(page).toHaveURL(/#button$/);
    expect(await page.evaluate(() => history.length)).toBe(historyLength);
    await expect(page.locator("#button")).toBeVisible();
  }
});

test("header actions stay available above the index and return focus correctly", async ({
  page,
}) => {
  await page.setViewportSize({ width: 392, height: 480 });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "light" });
  await page.goto("/#button");
  await page.getByRole("button", { name: "Open Components index" }).click();
  const index = page.getByRole("main", { name: "Components index" });
  const theme = page.getByRole("button", { name: /Switch to .* theme/ });
  await theme.click();
  await expect(index).toBeVisible();
  await expect(theme).toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-sui-theme", "dark");
  const figma = page
    .locator(".site-header")
    .getByRole("link", { name: "Figma access" });
  await expect(figma).toHaveAttribute(
    "href",
    "https://www.figma.com/design/2jnGtX6x5wYdoJDum40ovM/Serenity-UI---Design-System",
  );
  await page
    .getByRole("navigation", { name: "Website sections" })
    .getByRole("link", { name: "Documentation" })
    .click();
  await expect(index).toHaveCount(0);
  await expect(page.locator("#main")).toBeFocused();
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
});

test("contextual mobile indexes preserve examples, scroll and keyboard focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 392, height: 852 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#button");
  const example = page.getByRole("button", { name: "Try this button" });
  await example.click();
  await expect(page.getByText("Clicked 1 times")).toBeVisible();
  const element = await example.elementHandle();
  const scroll = await page.evaluate(() => window.scrollY);
  const panelScroll = await page
    .locator(".docs-main > [data-sui-scroll-viewport]")
    .evaluate((node) => node.scrollTop);
  const open = page.getByRole("button", { name: "Open Components index" });
  await open.click();
  const index = page.getByRole("main", { name: "Components index" });
  const search = index.getByRole("searchbox");
  await expect(search).toBeFocused();
  await expect(page.locator(".site-content")).toHaveAttribute("inert", "");
  await expect(index.getByRole("link")).toHaveCount(40);
  await search.fill("sign in");
  await expect(index.getByRole("status")).toHaveText(
    "No results found. Try another name.",
  );
  await expect(index.getByRole("heading", { level: 2 })).toHaveCount(0);
  await index.getByRole("button", { name: "Clear search" }).click();
  await expect(search).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(open).toBeFocused();
  expect(await element!.evaluate((node) => node.isConnected)).toBe(true);
  expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
  expect(
    await page
      .locator(".docs-main > [data-sui-scroll-viewport]")
      .evaluate((node) => node.scrollTop),
  ).toBe(panelScroll);
  await expect(page.getByText("Clicked 1 times")).toBeVisible();
  await open.click();
  await search.fill("date picker");
  await index.getByRole("link", { name: "DatePicker", exact: true }).click();
  await expect(page.locator("#datepicker")).toBeVisible();
  await expect(page.locator("#main")).toBeFocused();
  await expect(index).toHaveCount(0);
  await page.goBack();
  await expect(page.locator("#button")).toBeVisible();
  await open.click();
  await page.setViewportSize({ width: 1440, height: 1020 });
  await expect(index).toHaveCount(0);
  await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  await expect(page.locator("#main")).toBeFocused();
});

test("section navigation exposes meaningful home, page and documentation destinations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 392, height: 852 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#home");
  await page.getByRole("button", { name: "Open Home index" }).click();
  await page
    .getByRole("main", { name: "Home index" })
    .getByRole("link", { name: "Community" })
    .click();
  await expect(page).toHaveURL(/#home\/community$/);
  await expect(page.locator("#home-community")).toBeFocused();
  const bottom = page.getByRole("navigation", { name: "Website sections" });
  await bottom.getByRole("link", { name: "Pages", exact: true }).click();
  await expect(page.locator("#dashboard")).toBeVisible();
  await page.getByRole("button", { name: "Open Pages index" }).click();
  const pages = page.getByRole("main", { name: "Pages index" });
  await expect(pages.getByRole("link")).toHaveCount(2);
  await pages.getByRole("link", { name: "SignInForm" }).click();
  await expect(page.locator("#signinform")).toBeVisible();
  await bottom.getByRole("link", { name: "Documentation" }).click();
  await page.getByRole("button", { name: "Open Documentation index" }).click();
  const docs = page.getByRole("main", { name: "Documentation index" });
  await expect(docs.getByRole("link")).toHaveCount(6);
  await docs.getByRole("link", { name: "Application integration" }).click();
  await expect(page.locator("#documentation-integration")).toBeFocused();
  await expect(
    page.getByRole("link", { name: "Read the integration guide" }),
  ).toHaveAttribute(
    "href",
    "https://github.com/PolariSystem/sui-design-system/blob/main/docs/INTEGRATION.md",
  );
  await page.getByRole("button", { name: "Open Documentation index" }).click();
  await docs.getByRole("link", { name: "Theming" }).click();
  await expect(page.locator("#documentation-theming")).toBeFocused();
  await page.reload();
  await expect(page.locator("#documentation-theming")).toBeFocused();
});

test("approved chrome and content fit light and dark from narrow mobile to desktop", async ({
  page,
}, info) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    for (const width of [320, 392, 1024, 1440]) {
      await page.goto("about:blank");
      await page.setViewportSize({ width, height: width < 1024 ? 852 : 1020 });
      await page.goto("/#button");
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      const header = page.locator(".site-header");
      const panel = page.locator(".docs-main");
      const headerBox = (await header.boundingBox())!;
      const panelBox = (await panel.boundingBox())!;
      expect(headerBox.y).toBe(16);
      expect(headerBox.height).toBe(74);
      expect(panelBox.y - (headerBox.y + headerBox.height)).toBe(16);
      await expect(panel).not.toHaveCSS("box-shadow", "none");
      await expect(panel).toHaveCSS(
        "border-radius",
        width < 1024 ? "16px" : "24px",
      );
      await expect(page.locator(".docs-main-content")).toHaveCSS(
        "padding",
        width < 1024 ? "16px" : "32px",
      );
      if (width < 1024) {
        expect(panelBox.x).toBe(16);
        const nav = page.locator(".site-bottom-nav");
        const bottomBox = (await nav.boundingBox())!;
        expect(bottomBox.y + bottomBox.height).toBe(836);
        expect(bottomBox.y - (panelBox.y + panelBox.height)).toBe(16);
        await page.locator(".docs-footer").scrollIntoViewIfNeeded();
        expect(
          (await page.locator(".docs-footer").boundingBox())!.y +
            (await page.locator(".docs-footer").boundingBox())!.height,
        ).toBeLessThanOrEqual(bottomBox.y);
        await page.evaluate(() => window.scrollTo(0, 0));
        await panel
          .locator(":scope > [data-sui-scroll-viewport]")
          .evaluate((node) => node.scrollTo(0, 0));
      } else {
        await expect(page.locator(".docs-sidebar")).toBeVisible();
        expect((await page.locator(".docs-sidebar").boundingBox())!.y).toBe(
          panelBox.y,
        );
        await expect(page.locator(".site-bottom-nav")).toBeHidden();
      }
      if ([392, 1440].includes(width)) {
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
        await page.screenshot({
          path: info.outputPath(`workshop-${width}-${theme}.png`),
        });
      }
      if (width === 392) {
        await page
          .getByRole("button", { name: "Open Components index" })
          .click();
        const indexBox = (await page
          .locator(".site-mobile-index")
          .boundingBox())!;
        const bottomBox = (await page
          .locator(".site-bottom-nav")
          .boundingBox())!;
        expect(indexBox.y - (headerBox.y + headerBox.height)).toBe(16);
        expect(bottomBox.y - (indexBox.y + indexBox.height)).toBe(16);
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
        await page.screenshot({ path: info.outputPath(`index-${theme}.png`) });
      }
    }
  }
});

test("Pages is a direct link that survives repeated navigation and an open mobile index", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const nav = page.getByRole("navigation", {
    name: isMobile ? "Website sections" : "Website",
    exact: true,
  });
  for (const route of ["home", "button", "documentation", "signinform"]) {
    await page.goto(`/#${route}`);
    if (isMobile) {
      await page.getByRole("button", { name: /^Open .* index$/ }).click();
    }
    const link = nav.getByRole("link", { name: "Pages", exact: true });
    await expect(link).toHaveAttribute("href", "#dashboard");
    await expect(link).not.toHaveAttribute("aria-haspopup");
    await link.click();
    await expect(page.locator("#dashboard")).toBeVisible();
    await expect(page.locator("#main")).toBeFocused();
    await expect(page.locator(".site-content")).not.toHaveAttribute("inert");
    await expect(page.locator("body")).not.toHaveCSS("pointer-events", "none");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(link).toHaveAttribute("aria-current", "page");
    await link.click();
    await expect(page.locator("#dashboard")).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`#${route}$`));
    await page.goForward();
    await expect(page.locator("#dashboard")).toBeVisible();
  }
  expect(errors).toEqual([]);
});
