import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { documentationGuides } from "../../workshop/documentation-guides";

test("guides mount independently and preserve deep links and adjacent navigation", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const guide of documentationGuides) {
    await page.goto(`/#documentation${guide.id ? `/${guide.id}` : ""}`);
    await expect(page.locator("#documentation article")).toHaveCount(1);
    await expect(
      page.getByRole("heading", { name: guide.name, exact: true }),
    ).toBeVisible();
    if (guide.id)
      await expect(page.locator(`#documentation-${guide.id}`)).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/#documentation/forms");
  await page
    .getByRole("navigation", { name: "Adjacent pages" })
    .getByRole("link", { name: /Next/ })
    .click();
  await expect(page).toHaveURL(/#documentation\/integration$/);
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Forms and validation", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("#documentation-forms")).toBeFocused();
  await page
    .getByRole("textbox", { name: "Contact email" })
    .fill("ada@example.com");
  await page.getByRole("button", { name: "Save contact" }).click();
  await expect(page.getByRole("status")).toContainText("Contact saved.");
});

for (const theme of ["light", "dark"]) {
  test(`API and upload guides are usable in ${theme}`, async ({
    page,
  }, info) => {
    await page.addInitScript(
      (value) => localStorage.setItem("serenity-ui-theme", value),
      theme,
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/#documentation/components");
    await page.getByRole("combobox", { name: "API module" }).click();
    await page.getByRole("option", { name: "FileUpload", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "FileUpload API declaration" }),
    ).toContainText("onFilesSelect");
    expect(
      (await new AxeBuilder({ page }).include("#documentation").analyze())
        .violations,
    ).toEqual([]);
    await page.screenshot({ path: info.outputPath(`api-${theme}.png`) });
    await page.goto("/#documentation/uploads");
    await page.locator('input[type="file"]').setInputFiles({
      name: "example.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("name\nAda"),
    });
    await page.getByRole("button", { name: "Remove example.csv" }).click();
    await expect(
      page.getByRole("button", { name: "Choose a CSV attachment" }),
    ).toBeFocused();
    expect(
      (await new AxeBuilder({ page }).include("#documentation").analyze())
        .violations,
    ).toEqual([]);
  });
}
