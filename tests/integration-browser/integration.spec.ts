import { expect, test } from "@playwright/test";

test("server errors focus the field, successful forms refresh data, and records sort remotely", async ({
  page,
}, info) => {
  await page.goto("/");
  const name = page.getByRole("textbox", {
    name: "Workspace name",
    exact: true,
  });
  await name.fill("x");
  await page
    .getByRole("button", { name: "Create workspace", exact: true })
    .click();
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toBeFocused();
  await expect(
    page.getByText("Use between 3 and 80 characters."),
  ).toBeVisible();
  const created = `Browser ${info.project.name}`;
  await name.fill(created);
  await page.getByRole("checkbox", { name: "Receive updates" }).check();
  await page
    .getByRole("button", { name: "Create workspace", exact: true })
    .click();
  await expect(
    page.getByText("Workspace created.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Search workspaces" }).fill(created);
  await expect(
    page.getByRole("cell", { name: created, exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search workspaces" })
    .fill("Workspace");
  await expect(
    page.getByRole("cell", { name: "Workspace 01", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sort by Workspace" }).click();
  await expect(
    page.getByRole("cell", { name: "Workspace 12", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: "Workspace 08", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("dashboard save survives a reload and conflicts preserve the local draft", async ({
  page,
  request,
}) => {
  await page.goto("/");
  const save = page.getByRole("button", { name: "Save dashboard" });
  await expect(save).toBeVisible();
  const initial = await (await request.get("/api/dashboard")).json();
  // Exercise the real editor's size control rather than mutating browser state.
  await page
    .getByRole("group", { name: "Activity", exact: true })
    .getByRole("button", { name: "Settings" })
    .click();
  await page.getByRole("radio", { name: "Large (L)", exact: true }).check();
  await page.getByRole("button", { name: "Apply size" }).click();
  await save.click();
  await expect(
    page.getByText("Dashboard saved.", { exact: true }),
  ).toBeVisible();
  const saved = await (await request.get("/api/dashboard")).json();
  expect(saved.version).toBe(initial.version + 1);
  expect(
    saved.items.find((item: { id: string }) => item.id === "activity").size,
  ).toBe("L");
  await page.reload();
  await expect(
    page
      .getByRole("group", { name: "Activity", exact: true })
      .getByLabel("Large widget"),
  ).toBeVisible();
  await request.put("/api/dashboard", { data: saved });
  await save.click();
  await expect(
    page.getByText("The dashboard changed elsewhere. Reload before saving.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reload saved layout" }).click();
  await expect(save).toBeVisible();
  await save.click();
  await expect(
    page.getByText("Dashboard saved.", { exact: true }),
  ).toBeVisible();
});

test("failed reads retry and superseded requests cannot replace the latest filter", async ({
  page,
}) => {
  let fail = true;
  await page.route("**/api/records?**", async (route) => {
    const query = new URL(route.request().url()).searchParams.get("query");
    if (fail)
      return route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ message: "Service temporarily unavailable." }),
      });
    if (query === "slow") {
      await new Promise((resolve) => setTimeout(resolve, 400));
      return route
        .fulfill({
          json: {
            items: [
              {
                id: "stale",
                name: "Stale response",
                role: "viewer",
                updates: false,
              },
            ],
            total: 1,
          },
        })
        .catch(() => {});
    }
    await route.continue();
  });
  await page.goto("/");
  await expect(
    page.getByText("Service temporarily unavailable.", { exact: false }),
  ).toBeVisible();
  fail = false;
  await page.getByRole("button", { name: "Retry records" }).click();
  await expect(page.getByRole("table", { name: "Workspaces" })).toHaveAttribute(
    "aria-busy",
    "false",
  );
  const filter = page.getByRole("textbox", { name: "Search workspaces" });
  const slow = page.waitForRequest(
    (request) => new URL(request.url()).searchParams.get("query") === "slow",
  );
  await filter.fill("slow");
  await slow;
  await filter.fill("Workspace 12");
  await expect(
    page.getByRole("cell", { name: "Workspace 12", exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(500);
  await expect(
    page.getByRole("cell", { name: "Stale response", exact: true }),
  ).toHaveCount(0);
});
