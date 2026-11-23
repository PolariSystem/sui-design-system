import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import {
  Dashboard,
  DashboardEditor,
  moveDashboardItem,
  restoreDashboardLayout,
  serializeDashboardLayout,
  type DashboardItem,
  type DashboardWidgetDefinition,
} from "../src";

const widgets: DashboardWidgetDefinition[] = ["a", "b", "c"].map((id) => ({
  id,
  title: `Widget ${id}`,
  kind: "Metric",
  defaultZone: "summary",
  defaultSize: "S",
  sizes: ["S", "M", "L"],
}));
const defaults: DashboardItem[] = [
  { id: "a", zone: "summary", size: "S" },
  { id: "b", zone: "summary", size: "M" },
  { id: "c", zone: "hidden", size: "L" },
];

it("moves between zones and reorders without losing IDs or mutating the input", () => {
  const result = moveDashboardItem(defaults, "b", "summary", "a");
  expect(result.map((item) => item.id)).toEqual(["b", "a", "c"]);
  expect(defaults.map((item) => item.id)).toEqual(["a", "b", "c"]);
  expect(
    moveDashboardItem(result, "b", "analysis").find((item) => item.id === "b"),
  ).toEqual({ id: "b", size: "M", zone: "analysis" });
  expect(
    moveDashboardItem(defaults, "a", "summary")
      .filter((item) => item.zone === "summary")
      .map((item) => item.id),
  ).toEqual(["b", "a"]);
});
it.each([
  null,
  "invalid",
  '{"version":2,"items":[]}',
  '{"version":1,"items":{}}',
])("falls back safely for unsupported saved data %s", (serialized) => {
  expect(restoreDashboardLayout(serialized, widgets, defaults)).toEqual(
    defaults,
  );
});
it("reconciles duplicate, removed, invalid and newly available widgets", () => {
  const serialized = JSON.stringify({
    version: 1,
    items: [
      { id: "b", zone: "analysis", size: "L" },
      { id: "b", zone: "hidden", size: "S" },
      { id: "removed", zone: "summary", size: "S" },
      { id: "a", zone: "invalid", size: "XL" },
      null,
      "bad",
    ],
  });
  expect(restoreDashboardLayout(serialized, widgets, defaults)).toEqual([
    { id: "b", zone: "analysis", size: "L" },
    defaults[0],
    defaults[2],
  ]);
  expect(
    restoreDashboardLayout(
      serializeDashboardLayout(defaults),
      widgets,
      defaults,
    ),
  ).toEqual(defaults);
});
it("rejects invalid controlled configurations instead of rendering partial dashboards", () => {
  expect(() =>
    render(
      <Dashboard
        widgets={widgets}
        value={[defaults[0], defaults[0], defaults[2]]}
        renderWidget={() => null}
      />,
    ),
  ).toThrow(/duplicate/);
  expect(() =>
    restoreDashboardLayout(null, [widgets[0], widgets[0]], defaults),
  ).toThrow(/unique/);
});
it("omits hidden widgets while keeping fixed records outside both zones", () => {
  render(
    <Dashboard
      widgets={widgets}
      value={defaults}
      renderWidget={(widget) => <p>{widget.title}</p>}
    >
      <div>Fixed records</div>
    </Dashboard>,
  );
  expect(screen.queryByText("Widget c")).not.toBeInTheDocument();
  expect(
    within(screen.getByRole("region", { name: "Summary widgets" })).getByText(
      "Widget a",
    ),
  ).toBeVisible();
  expect(screen.getByText("Fixed records").closest("section")).toBeNull();
});
it("reorders with buttons, announces changes and restores hidden widgets", async () => {
  const user = userEvent.setup();
  function Example() {
    const [value, setValue] = useState(defaults);
    return (
      <DashboardEditor widgets={widgets} value={value} onChange={setValue} />
    );
  }
  render(<Example />);
  const first = screen.getByRole("group", { name: "Widget a" });
  expect(within(first).getByRole("button", { name: "Move up" })).toBeDisabled();
  await user.click(within(first).getByRole("button", { name: "Move down" }));
  expect(screen.getByRole("status")).toHaveTextContent(
    "Widget a moved to Summary, position 2.",
  );
  expect(screen.getByRole("button", { name: "Drag Widget a" })).toHaveFocus();
  const hidden = screen.getByRole("group", { name: "Widget c" });
  await user.click(within(hidden).getByRole("button", { name: "Show" }));
  expect(
    within(
      screen.getByRole("region", { name: "Summary editor zone" }),
    ).getByRole("group", { name: "Widget c" }),
  ).toBeVisible();
  expect(screen.getByRole("button", { name: "Drag Widget c" })).toHaveFocus();
});

it("renders the real widget content in live mode and keeps hidden widgets in the catalog model", () => {
  render(
    <DashboardEditor
      widgets={widgets}
      value={defaults}
      onChange={() => {}}
      renderWidget={(widget) => <p>{`${widget.title} data`}</p>}
    />,
  );
  expect(screen.getByText("Widget a data")).toBeVisible();
  expect(screen.getByText("Widget b data")).toBeVisible();
  expect(screen.queryByText("Widget c data")).not.toBeInTheDocument();
  expect(
    screen.queryByRole("region", { name: "Hidden editor zone" }),
  ).not.toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Widget actions for Widget a" }),
  ).toBeVisible();
});
