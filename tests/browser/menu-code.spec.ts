import { test, expect } from "@playwright/test";

test("all component source is public and support stays hidden until configured", async ({
  page,
}) => {
  for (const route of ["button", "signinform", "documentation"]) {
    await page.goto("/#" + route);
    await expect(page.locator(".docs-context")).toContainText(
      "Open source · MIT",
    );
    await expect(
      page.getByRole("link", { name: "GitHub", exact: true }),
    ).toHaveAttribute(
      "href",
      "https://github.com/PolariSystem/sui-design-system",
    );
    await expect(
      page.getByRole("link", { name: /Support Serenity/ }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: /Purchase|Compare plans/ }),
    ).toHaveCount(0);
  }
  await expect(
    page.getByRole("region", { name: "Getting started commands" }),
  ).toContainText("npm ci");
});

test("mobile inputs and selects fill their available column", async ({
  page,
}) => {
  for (const width of [320, 392, 639]) {
    await page.setViewportSize({ width, height: 852 });
    for (const route of [
      "signinform",
      "input",
      "select",
      "textarea",
      "passwordinput",
    ]) {
      await page.goto(`/#${route}`);
      await expect(page.locator(`#${route}`)).toBeVisible();
      const fields = page.locator(`#${route} .sui-field`);
      expect(await fields.count()).toBeGreaterThan(0);
      for (const field of await fields.all()) {
        const sizes = await field.evaluate((node) => {
          const parent = node.parentElement!;
          const style = getComputedStyle(parent);
          const available =
            parent.clientWidth -
            parseFloat(style.paddingLeft) -
            parseFloat(style.paddingRight);
          return {
            available,
            width: node.getBoundingClientRect().width,
            parentDisplay: style.display,
            columns: style.gridTemplateColumns,
          };
        });
        // A multi-column specimen owns its column width; ordinary form rows fill the parent.
        if (sizes.parentDisplay !== "grid" || !sizes.columns.includes(" "))
          expect(Math.abs(sizes.available - sizes.width)).toBeLessThan(2);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
  }
});
