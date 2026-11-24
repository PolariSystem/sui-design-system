import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
for (const mode of ["light", "dark"]) {
  test(`file selection supports keyboard, rejection, cancellation and retry in ${mode}`, async ({
    page,
  }, info) => {
    await page.addInitScript(
      (theme) => localStorage.setItem("serenity-ui-theme", theme),
      mode,
    );
    await page.goto("/#fileupload");
    const browse = page.getByRole("button", {
      name: "Choose a sample attachment",
    });
    await browse.focus();
    const picker = page.waitForEvent("filechooser");
    await page.keyboard.press("Enter");
    await (
      await picker
    ).setFiles({
      name: "records.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("name,team\nAda,Design"),
    });
    const row = page
      .locator(".sui-file-upload-item")
      .filter({ hasText: "records.csv" })
      .last();
    await expect(row).toHaveAttribute("data-status", "queued");
    await page
      .getByRole("button", { name: "Upload sample", exact: true })
      .click();
    await expect(row.getByRole("progressbar")).toBeVisible();
    await row.getByRole("button", { name: "Cancel records.csv" }).click();
    await expect(row).toHaveAttribute("data-status", "cancelled");
    await expect(
      row.getByRole("button", { name: "Retry records.csv" }),
    ).toBeFocused();
    await row.getByRole("button", { name: "Retry records.csv" }).click();
    await page.getByRole("button", { name: "Simulate interruption" }).click();
    await expect(row).toHaveAttribute("data-status", "error");
    await row.getByRole("button", { name: "Retry records.csv" }).click();
    await expect(row).toHaveAttribute("data-status", "success");
    await row.getByRole("button", { name: "Remove records.csv" }).click();
    await expect(browse).toBeFocused();
    const input = page.locator(
      'input[type="file"][aria-label="Choose a sample attachment"]',
    );
    await input.setInputFiles({
      name: "bad.exe",
      mimeType: "application/octet-stream",
      buffer: Buffer.from("invalid"),
    });
    await expect(browse).toContainText(
      "bad.exe: This file type is not accepted.",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(browse).toHaveCSS("transition-duration", "0s");
    expect(
      (await new AxeBuilder({ page }).include("#fileupload").analyze())
        .violations,
    ).toEqual([]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await browse.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`upload-${mode}.png`) });
    const uploading = page
      .locator('.sui-file-upload-item[data-status="uploading"]')
      .first();
    await uploading.scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath(`upload-row-${mode}.png`) });
    const transfer = await page.evaluateHandle(() => {
      const data = new DataTransfer();
      data.items.add(
        new File(["name,team\nAda,Design"], "dropped.csv", {
          type: "text/csv",
        }),
      );
      return data;
    });
    await browse.dispatchEvent("dragenter", { dataTransfer: transfer });
    await expect(browse).toHaveAttribute("data-dragging", "true");
    await browse.dispatchEvent("drop", { dataTransfer: transfer });
    await expect(browse).toHaveAttribute("data-dragging", "false");
    await expect(
      page
        .locator('.sui-file-upload-item[data-status="queued"]')
        .filter({ hasText: "dropped.csv" }),
    ).toBeVisible();
    await transfer.dispose();
  });
}
