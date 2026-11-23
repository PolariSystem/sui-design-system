export interface ChartDatum {
  id: string;
  label: string;
  value: number;
}
export interface ChartMatrixRow {
  id: string;
  label: string;
  values: readonly number[];
}
export interface ChartPoint {
  id: string;
  label: string;
  x: number;
  y: number;
}
interface ChartBase {
  label: string;
  /** Animate visual values from zero on first data presentation. Reduced motion always wins. */
  animated?: boolean;
  /** Change this key to replay values without unmounting the chart, axes or data table. */
  animationKey?: string | number;
  description?: string;
  className?: string;
  /** The same data table is always available to assistive technology. */
  showDataTable?: boolean;
  dataTableLabel?: string;
  emptyLabel?: string;
  emptyDescription?: string;
  formatValue?: (value: number) => string;
  categoryLabel?: string;
  valueLabel?: string;
}
interface SeriesChart extends ChartBase {
  type: "line" | "area" | "column" | "histogram" | "horizontal-bar" | "funnel";
  data: readonly ChartDatum[];
  /** Positive zero-based ceiling; must include every value. Auto-derived when omitted. */
  max?: number;
  note?: string;
}
interface MetricChart extends ChartBase {
  type: "metric";
  value: number;
  data: readonly ChartDatum[];
  comparison?: string;
  comparisonTone?: "neutral" | "success" | "danger";
}
interface DonutChart extends ChartBase {
  type: "donut";
  /** At most six parts; zero-valued parts remain in the legend and data table. */
  data: readonly ChartDatum[];
  unit?: string;
}
interface GoalChart extends ChartBase {
  type: "goal";
  value: number;
  max: number;
  target?: number;
  summary?: string;
}
interface StackedChart extends ChartBase {
  type: "stacked-bar";
  /** One to six series. Values are normalized per row; an all-zero row stays empty. */
  series: readonly string[];
  data: readonly ChartMatrixRow[];
}
interface HeatmapChart extends ChartBase {
  type: "heatmap";
  columns: readonly string[];
  data: readonly ChartMatrixRow[];
  max?: number;
  note?: string;
}
interface ScatterChart extends ChartBase {
  type: "scatter";
  data: readonly ChartPoint[];
  xLabel: string;
  yLabel: string;
  xMax?: number;
  yMax?: number;
}
/** Count-based charts accept finite nonnegative values, with unique, nonempty data IDs. */
export type ChartProps =
  | SeriesChart
  | MetricChart
  | DonutChart
  | GoalChart
  | StackedChart
  | HeatmapChart
  | ScatterChart;
