import { expect, test } from "@playwright/test";
test("real upload validates content and retries server failures without losing the file", async ({
  page,
}) => {
  await page.goto("/");
  const input = page.locator(
    'input[type="file"][aria-label="Choose CSV attachments"]',
  );
  await input.setInputFiles({
    name: "records.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("name,team\nAda,Design"),
  });
  const row = page.locator(".sui-file-upload-item");
  let fail = true;
  await page.route("**/api/uploads?**", async (route) => {
    if (fail)
      await route.fulfill({
        status: 503,
        json: { message: "Temporary upload failure." },
      });
    else await route.continue();
  });
  await page.getByRole("button", { name: "Upload selected files" }).click();
  await expect(row).toHaveAttribute("data-status", "error");
  await expect(row).toContainText("Temporary upload failure.");
  fail = false;
  const accepted = page.waitForResponse(
    (response) =>
      response.url().includes("/api/uploads?") && response.status() === 201,
  );
  await row.getByRole("button", { name: "Retry records.csv" }).click();
  const receipt = await (await accepted).json();
  expect(receipt.name).toBe("records.csv");
  expect(receipt.sha256).toMatch(/^[0-9a-f]{64}$/);
  await expect(row).toHaveAttribute("data-status", "success");
  await row.getByRole("button", { name: "Remove records.csv" }).click();
  await input.setInputFiles({
    name: "empty.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(""),
  });
  await page.getByRole("button", { name: "Upload selected files" }).click();
  await expect(row).toHaveAttribute("data-status", "error");
  await expect(row).toContainText("Use a nonempty CSV file");
});

test("cancellation ignores a delayed result and preserves the file for retry", async ({
  page,
}) => {
  await page.goto("/");
  await page.route("**/api/uploads?**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    await route
      .fulfill({
        status: 201,
        json: { id: "late", name: "records.csv", size: 3, sha256: "ignored" },
      })
      .catch(() => {});
  });
  await page
    .locator('input[type="file"][aria-label="Choose CSV attachments"]')
    .setInputFiles({
      name: "records.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("a,b"),
    });
  await page.getByRole("button", { name: "Upload selected files" }).click();
  const row = page.locator(".sui-file-upload-item");
  await row.getByRole("button", { name: "Cancel records.csv" }).click();
  await expect(row).toHaveAttribute("data-status", "cancelled");
  await page.waitForTimeout(1000);
  await expect(row).toHaveAttribute("data-status", "cancelled");
  await expect(
    row.getByRole("button", { name: "Retry records.csv" }),
  ).toBeEnabled();
});
