import { render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { Chart, Widget, type ChartProps } from "../src";
import { chartExamples } from "../workshop/chart-examples";
import {
  chartMaximum,
  chartTable,
  validateChart,
} from "../src/components/internal/chart-data";

it.each(chartExamples)(
  "renders $name with a named semantic data alternative",
  ({ chart }) => {
    render(<Chart {...chart} />);
    expect(
      screen.getByRole("figure", { name: chart.label }),
    ).toBeInTheDocument();
    const table = screen.getByRole("table", { name: `${chart.label} data` });
    expect(within(table).getAllByRole("row")).toHaveLength(
      chartTable(chart).rows.length + 1,
    );
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  },
);

it("keeps the data alternative current and exposes a focusable viewport only when visible", () => {
  const props: ChartProps = {
    type: "line",
    label: "Activity",
    data: [{ id: "a", label: "April", value: 12 }],
  };
  const { rerender } = render(<Chart {...props} />);
  expect(screen.getByRole("cell", { name: "12" })).toBeInTheDocument();
  rerender(
    <Chart
      {...props}
      showDataTable
      data={[{ id: "a", label: "April", value: 24 }]}
    />,
  );
  expect(screen.queryByRole("cell", { name: "12" })).not.toBeInTheDocument();
  expect(screen.getByRole("cell", { name: "24" })).toBeInTheDocument();
  expect(screen.getByRole("region")).toHaveAttribute("tabindex", "0");
});

it("distinguishes absent data from a genuine zero-valued series", () => {
  const { rerender, container } = render(
    <Chart type="donut" label="Status" data={[]} />,
  );
  expect(
    screen.getByRole("heading", { name: "No data yet" }),
  ).toBeInTheDocument();
  rerender(
    <Chart
      type="donut"
      label="Status"
      data={[{ id: "a", label: "Done", value: 0 }]}
    />,
  );
  expect(
    screen.queryByRole("heading", { name: "No data yet" }),
  ).not.toBeInTheDocument();
  expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
  rerender(
    <Chart
      type="stacked-bar"
      label="Teams"
      series={["Done", "Queued"]}
      data={[{ id: "a", label: "A", values: [0, 0] }]}
    />,
  );
  expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
  expect(container.querySelectorAll(".sui-chart-stack > span")[0]).toHaveStyle({
    width: "0%",
  });
});

it("normalizes stacked proportions without changing the original table values", () => {
  const { container } = render(
    <Chart
      type="stacked-bar"
      label="Mix"
      series={["Done", "Queued"]}
      data={[{ id: "a", label: "Team", values: [2, 6] }]}
    />,
  );
  expect(container.querySelector(".sui-chart-stack > span")).toHaveStyle({
    width: "25%",
  });
  expect(screen.getByRole("cell", { name: "2" })).toBeInTheDocument();
  expect(screen.getByRole("cell", { name: "6" })).toBeInTheDocument();
});

it("validates scale bounds, finite counts, IDs, matrices and funnel ordering", () => {
  const cases: ChartProps[] = [
    { type: "line", label: "A", data: [{ id: "a", label: "A", value: -1 }] },
    { type: "line", label: "A", data: [{ id: "a", label: "A", value: NaN }] },
    {
      type: "line",
      label: "A",
      max: 2,
      data: [{ id: "a", label: "A", value: 3 }],
    },
    { type: "line", label: "A", data: [{ id: "", label: "A", value: 3 }] },
    { type: "goal", label: "A", max: 0, value: 0 },
    { type: "goal", label: "A", max: 100, value: 30, target: 110 },
    {
      type: "heatmap",
      label: "A",
      columns: ["Mon", "Tue"],
      data: [{ id: "a", label: "A", values: [1] }],
    },
    {
      type: "funnel",
      label: "A",
      data: [
        { id: "a", label: "A", value: 1 },
        { id: "b", label: "B", value: 2 },
      ],
    },
    {
      type: "donut",
      label: "A",
      data: [
        { id: "a", label: "A", value: Number.MAX_VALUE },
        { id: "b", label: "B", value: Number.MAX_VALUE },
      ],
    },
  ];
  cases.forEach((props) =>
    expect(() => validateChart(props)).toThrow(RangeError),
  );
  expect(chartMaximum([0, 0])).toBe(1);
});

it("keeps goal values accessible and loading/error precedence explicit", () => {
  const chart: ChartProps = {
    type: "goal",
    label: "Goal",
    value: 72,
    target: 80,
    max: 100,
  };
  const { rerender } = render(
    <Widget title="Delivery goal" chart={chart} loading error="Unavailable" />,
  );
  expect(screen.getByRole("region", { name: "Delivery goal" })).toHaveAttribute(
    "aria-busy",
    "true",
  );
  expect(screen.getByRole("status")).toHaveTextContent("Loading widget");
  expect(screen.queryByRole("figure")).not.toBeInTheDocument();
  rerender(<Widget title="Delivery goal" chart={chart} error="Unavailable" />);
  expect(screen.getByRole("alert")).toHaveTextContent("Unavailable");
  rerender(<Widget title="Delivery goal" chart={chart} />);
  expect(screen.getByRole("cell", { name: "80" })).toBeInTheDocument();
});
