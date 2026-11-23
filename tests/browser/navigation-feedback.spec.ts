import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("tabs separate keyboard focus from selection and skip unavailable views", async ({
  page,
}) => {
  await page.goto("/#tabs");
  const list = page.getByRole("tablist", { name: "Record views", exact: true });
  const first = list.getByRole("tab", { name: "All records" });
  const assigned = list.getByRole("tab", { name: "Assigned to me" });
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(assigned).toBeFocused();
  await expect(first).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("tabpanel", { name: "Assigned to me" }),
  ).toHaveText("You have 8 assigned records.");
  await page.keyboard.press("ArrowRight");
  await expect(first).toBeFocused();
  await page.keyboard.press("End");
  await expect(assigned).toBeFocused();
  await page.keyboard.press("Home");
  await expect(first).toBeFocused();
});

test("pagination and completed steps change the preview without bypassing bounds", async ({
  page,
}) => {
  await page.goto("/#pagination");
  const pagination = page.getByRole("navigation", { name: "Preview results" });
  await expect(
    pagination.getByRole("button", { name: "Previous" }),
  ).toBeDisabled();
  await pagination.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("Showing preview page 2.")).toBeVisible();
  await expect(
    pagination.locator('[aria-current="page"]'),
  ).toHaveAccessibleName("Page 2");
  await page.goto("/#stepper");
  await page.getByRole("button", { name: "Continue step" }).click();
  await expect(page.getByText("Step 2: Map fields")).toBeVisible();
  await page.getByRole("button", { name: /Upload file — Completed/ }).click();
  await expect(page.getByText("Step 1: Upload file")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Previous step" }),
  ).toBeDisabled();
});

test("sidebar keeps route names, active artwork and focus when compacted", async ({
  page,
}) => {
  await page.goto("/#sidebar");
  const sidebar = page.locator("#sidebar .sui-sidebar").last();
  const records = sidebar.getByRole("link", { name: "Records", exact: true });
  const defaultIcon = await records.locator("img").getAttribute("src");
  await records.click();
  await expect(records).toHaveAttribute("aria-current", "page");
  await expect(records.locator("img")).not.toHaveAttribute("src", defaultIcon!);
  await sidebar.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(
    page.getByRole("button", { name: "Expand sidebar" }),
  ).toBeFocused();
  await expect(sidebar).toHaveCSS("width", "40px");
  await expect(records).toHaveAccessibleName("Records");
  expect((await records.boundingBox())!.height).toBe(40);
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await expect(sidebar).toHaveCSS("width", "208px");
});

test("navbar uses native search on desktop and active mobile navigation", async ({
  page,
}, testInfo) => {
  await page.goto("/#navbar");
  const navbar = page.locator("#navbar .sui-navbar").last();
  if (testInfo.project.name === "desktop") {
    const search = navbar.getByRole("searchbox", { name: "Search workspace" });
    await search.fill("Quarterly report");
    await search.press("Enter");
    await expect(
      page.getByText(/Searching this preview for “Quarterly report”/),
    ).toBeVisible();
    expect(
      (await navbar
        .getByRole("button", { name: "Show notifications" })
        .boundingBox())!.height,
    ).toBe(40);
  } else {
    const records = navbar.getByRole("link", { name: "Records", exact: true });
    const defaultIcon = await records.locator("img").getAttribute("src");
    await records.click();
    await expect(records).toHaveAttribute("aria-current", "page");
    await expect(records.locator("img")).not.toHaveAttribute(
      "src",
      defaultIcon!,
    );
    await expect(
      navbar.getByRole("searchbox", { name: "Search workspace" }),
    ).not.toBeVisible();
  }
});

test("toast actions persist, preserve focus and support F8, undo and Escape", async ({
  page,
}) => {
  await page.goto("/#toast");
  const archive = page.getByRole("button", { name: "Archive sample" });
  await archive.focus();
  await page.keyboard.press("Enter");
  const toast = page
    .locator(".sui-toast")
    .filter({ hasText: "Record archived" });
  await expect(toast).toBeVisible();
  await expect(toast.locator(":focus")).toHaveCount(0);
  await page.clock.install();
  await page.clock.fastForward(6000);
  await expect(toast).toBeVisible();
  await page.keyboard.press("F8");
  await expect(
    page
      .getByRole("region", { name: "Preview notifications (F8)" })
      .locator("ol"),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(toast).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(toast.getByRole("button", { name: "Dismiss" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    toast.getByRole("button", { name: "Undo archive" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByText("The sample record is active.")).toBeVisible();
  await expect(toast).not.toBeVisible();
  await archive.click();
  await page.keyboard.press("F8");
  await page.keyboard.press("Escape");
  await expect(toast).not.toBeVisible();
  await expect(page.getByText("The sample record is archived.")).toBeVisible();
});

test("compact toast duration pauses on focus and resumes after leaving", async ({
  page,
}) => {
  await page.goto("/#toast");
  await page.clock.install();
  await page.getByRole("button", { name: "Show compact feedback" }).click();
  const toast = page
    .locator(".sui-toast")
    .filter({ hasText: "Preview synced" });
  await expect(toast).toBeVisible();
  await page.keyboard.press("F8");
  await page.clock.fastForward(6000);
  await expect(toast).toBeVisible();
  await page.getByRole("button", { name: "Show compact feedback" }).focus();
  await page.mouse.move(0, 0);
  await page.clock.fastForward(6000);
  await expect(toast).not.toBeVisible();
});

test("feedback examples handle validation, progress, loading and empty content", async ({
  page,
}) => {
  await page.goto("/#alert");
  await page.getByRole("button", { name: "Validate workspace" }).click();
  await expect(
    page.getByText("A workspace name is required", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Feedback workspace name" })
    .fill("Acme");
  await page.getByRole("button", { name: "Validate workspace" }).click();
  await expect(page.getByText("Workspace details are ready")).toBeVisible();
  await page.goto("/#progress");
  const progress = page
    .locator("#progress .sui-progress")
    .last()
    .getByRole("progressbar");
  await page.getByRole("button", { name: "Advance progress" }).click();
  await expect(progress).toHaveAttribute("aria-valuenow", "25");
  await page.getByRole("button", { name: "Interrupt import" }).click();
  await expect(
    page.getByRole("button", { name: "Advance progress" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Resume import" }).click();
  await page.goto("/#skeleton");
  await page.getByRole("button", { name: "Reload sample records" }).click();
  const region = page.getByRole("region", {
    name: "Sample records",
    exact: true,
  });
  await expect(region).toHaveAttribute("aria-busy", "true");
  await expect(region).toHaveAttribute("aria-busy", "false");
  await expect(region.getByText("Alex Morgan")).toBeVisible();
  await page.goto("/#emptystate");
  await page.getByRole("button", { name: "Create preview record" }).click();
  await expect(
    page.getByText("Your first preview record is ready."),
  ).toBeVisible();
  await page.goto("/#tag");
  await page.getByRole("button", { name: "Remove Operations" }).click();
  await expect(page.getByText("1 teams selected.")).toBeVisible();
});

test("new families respect reduced motion and narrow screens", async ({
  page,
}) => {
  await page.goto("/");
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const [route, selector, property, value] of [
    ["skeleton", ".sui-skeleton-decoration", "animation-name", "none"],
    [
      "progress",
      '.sui-progress[data-state="indeterminate"] .sui-progress-fill',
      "animation-name",
      "none",
    ],
    ["toast", ".sui-toast", "animation-name", "none"],
    ["link", ".sui-link", "transition-duration", "0s"],
    ["tabs", ".sui-tab", "transition-duration", "0s"],
    ["navbar", ".sui-nav-item", "transition-duration", "0s"],
    ["sidebar", ".sui-sidebar-identity", "transition-duration", "0s"],
  ]) {
    await page.goto("/#" + route);
    await expect(page.locator(selector).first()).toHaveCSS(property, value);
    expect(
      (
        await new AxeBuilder({ page })
          .include("#" + route)
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
});
