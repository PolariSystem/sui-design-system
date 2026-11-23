import type { ChartDatum, ChartProps } from "../src";

const series = (labels: string[], values: number[]): ChartDatum[] =>
  labels.map((label, i) => ({ id: label, label, value: values[i] }));
const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

export interface ChartExample {
  name: string;
  title: string;
  subtitle: string;
  chart: ChartProps;
  guidance: string;
  placement: string;
  menu?: boolean;
  wide?: boolean;
}

/** These values reproduce the approved Figma specimens; they are local sample data, not a service. */
export const chartExamples: ChartExample[] = [
  {
    name: "Metric",
    title: "Active records",
    subtitle: "Current workspace",
    chart: {
      type: "metric",
      label: "Active records trend",
      value: 1248,
      comparison: "↑ 8.2% vs previous month",
      comparisonTone: "success",
      data: series(
        [
          "Week 1",
          "Week 2",
          "Week 3",
          "Week 4",
          "Week 5",
          "Week 6",
          "Week 7",
          "Week 8",
        ],
        [8, 14, 10, 20, 16, 24, 21, 28],
      ),
    },
    guidance: "Read a headline number and recent direction.",
    placement: "Metric + sparkline · S · Summary",
  },
  {
    name: "Line",
    title: "Created records",
    subtitle: "Records · Apr–Sep 2026",
    chart: {
      type: "line",
      label: "Created records",
      max: 240,
      data: series(months, [120, 150, 132, 188, 174, 220]),
    },
    guidance: "Compare change over time.",
    placement: "Line · M / L · Analysis",
    menu: true,
    wide: true,
  },
  {
    name: "Area",
    title: "Cumulative completions",
    subtitle: "Records · Apr–Sep 2026",
    chart: {
      type: "area",
      label: "Cumulative completions",
      max: 600,
      data: series(months, [100, 180, 260, 390, 480, 600]),
    },
    guidance: "Show how a cumulative total grows over time.",
    placement: "Area · M / L · Analysis",
  },
  {
    name: "Column",
    title: "Weekly throughput",
    subtitle: "Completed records · W1–W6",
    chart: {
      type: "column",
      label: "Weekly throughput",
      max: 50,
      data: series(
        ["W1", "W2", "W3", "W4", "W5", "W6"],
        [18, 26, 34, 28, 42, 38],
      ),
    },
    guidance: "Compare totals across short categories.",
    placement: "Column · M / L · Analysis",
  },
  {
    name: "Horizontal bar",
    title: "Open work by team",
    subtitle: "Open records · Current snapshot",
    chart: {
      type: "horizontal-bar",
      label: "Open work by team",
      max: 72,
      note: "Records · baseline 0",
      data: series(
        ["Product", "Support", "Sales", "Operations"],
        [48, 36, 24, 12],
      ),
    },
    guidance: "Compare category totals from a shared baseline.",
    placement: "Horizontal bar · M / L · Analysis",
    menu: true,
    wide: true,
  },
  {
    name: "100% stacked bar",
    title: "Delivery mix",
    subtitle: "Share of records · Current snapshot",
    chart: {
      type: "stacked-bar",
      label: "Delivery mix",
      series: ["Done", "Active", "Queued"],
      data: [
        { id: "product", label: "Product", values: [60, 25, 15] },
        { id: "support", label: "Support", values: [45, 35, 20] },
        { id: "sales", label: "Sales", values: [70, 20, 10] },
      ],
    },
    guidance: "Done / Active / Queued · 0–100%",
    placement: "Stacked bar · M / L · Analysis",
    menu: true,
    wide: true,
  },
  {
    name: "Goal",
    title: "Quarterly goal",
    subtitle: "Completed milestones · Q3 2026",
    chart: {
      type: "goal",
      label: "Quarterly goal",
      value: 72,
      max: 100,
      target: 80,
    },
    guidance: "Compare progress with an explicit target.",
    placement: "Goal · M / L · Analysis",
    menu: true,
    wide: true,
  },
  {
    name: "Donut",
    title: "Record status",
    subtitle: "100 records · Current snapshot",
    chart: {
      type: "donut",
      label: "Record status",
      unit: "records",
      data: series(["Done", "Active", "Queued"], [60, 25, 15]),
    },
    guidance: "Show a few clearly labelled parts of a whole.",
    placement: "Donut · M · Analysis",
  },
  {
    name: "Funnel",
    title: "Activation funnel",
    subtitle: "Accounts · September 2026 cohort",
    chart: {
      type: "funnel",
      label: "Activation funnel",
      data: series(
        ["Visitors", "Qualified", "Trial", "Activated"],
        [1000, 600, 300, 120],
      ),
      note: "12% visitor → activated",
    },
    guidance: "Reveal drop-off across sequential stages.",
    placement: "Funnel · M / L · Analysis",
  },
  {
    name: "Heatmap",
    title: "Team activity",
    subtitle: "Events per day · Four weeks",
    chart: {
      type: "heatmap",
      label: "Team activity",
      max: 9,
      columns: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      data: [
        [2, 4, 6, 3, 1],
        [4, 7, 8, 5, 2],
        [3, 5, 9, 7, 4],
        [5, 6, 8, 4, 2],
      ].map((values, i) => ({ id: `w${i + 1}`, label: `W${i + 1}`, values })),
      note: "Values shown in cells · 0–9 events",
    },
    guidance: "Find repeated activity patterns across a grid.",
    placement: "Heatmap · M / L · Analysis",
  },
  {
    name: "Scatter",
    title: "Effort vs cycle time",
    subtitle: "7 completed records · September 2026",
    chart: {
      type: "scatter",
      label: "Effort vs cycle time",
      xLabel: "Effort (hours)",
      yLabel: "Cycle (days)",
      xMax: 10,
      yMax: 10,
      data: [
        [1, 2],
        [2, 1],
        [3, 4],
        [4, 3],
        [5, 6],
        [7, 5],
        [8, 8],
      ].map(([x, y], i) => ({
        id: `record-${i}`,
        label: `Record ${i + 1}`,
        x,
        y,
      })),
    },
    guidance: "Explore a relationship between two measures.",
    placement: "Scatter · M / L · Analysis",
  },
  {
    name: "Histogram",
    title: "Resolution time",
    subtitle: "Hours · 70 requests · Sep 2026",
    chart: {
      type: "histogram",
      label: "Resolution time",
      max: 30,
      data: series(["0–2", "2–4", "4–6", "6–8", "8–10"], [12, 28, 18, 9, 3]),
      categoryLabel: "Hours",
      valueLabel: "Requests",
    },
    guidance: "Show the distribution of a numeric measure.",
    placement: "Histogram · M / L · Analysis",
  },
];
