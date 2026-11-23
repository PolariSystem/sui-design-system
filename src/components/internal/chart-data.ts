import type { ChartProps } from "../Chart.types";

const numberFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});
export const formatChartValue = (value: number) => numberFormat.format(value);
export function chartSum(values: readonly number[]) {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (!Number.isFinite(total))
    throw new RangeError("Chart totals must be finite.");
  return total;
}
export function chartMaximum(values: readonly number[], requested?: number) {
  const largest = values.reduce((max, value) => Math.max(max, value), 0);
  if (requested !== undefined) {
    if (!Number.isFinite(requested) || requested <= 0 || requested < largest)
      throw new RangeError(
        "Chart maximum must be positive, finite and include every value.",
      );
    return requested;
  }
  return largest || 1;
}
function validateValues(values: readonly number[]) {
  if (values.some((value) => !Number.isFinite(value) || value < 0))
    throw new RangeError("Chart values must be finite and nonnegative.");
}

/** Reject invalid data rather than silently clipping marks or changing the reported values. */
export function validateChart(props: ChartProps) {
  if (props.type === "goal") {
    validateValues([
      props.value,
      ...(props.target === undefined ? [] : [props.target]),
    ]);
    chartMaximum([props.value, props.target ?? 0], props.max);
    return;
  }
  const ids = props.data.map((row) => row.id);
  if (ids.some((id) => !id) || new Set(ids).size !== ids.length)
    throw new RangeError("Chart data requires nonempty unique IDs.");
  if (props.type === "scatter") {
    validateValues(props.data.flatMap((point) => [point.x, point.y]));
    chartMaximum(
      props.data.map((p) => p.x),
      props.xMax,
    );
    chartMaximum(
      props.data.map((p) => p.y),
      props.yMax,
    );
  } else if (props.type === "stacked-bar" || props.type === "heatmap") {
    const labels = props.type === "heatmap" ? props.columns : props.series;
    if (
      !labels.length ||
      new Set(labels).size !== labels.length ||
      labels.some((label) => !label.trim()) ||
      (props.type === "stacked-bar" && labels.length > 6) ||
      props.data.some((row) => row.values.length !== labels.length)
    )
      throw new RangeError(
        "Chart matrix columns must be named, unique and match every row; stacked charts support up to six series.",
      );
    const values = props.data.flatMap((row) => [...row.values]);
    validateValues(values);
    if (props.type === "heatmap") chartMaximum(values, props.max);
    else props.data.forEach((row) => chartSum(row.values));
  } else {
    const values = props.data.map((row) => row.value);
    validateValues(values);
    if (props.type === "metric") validateValues([props.value]);
    else if (props.type === "donut") {
      if (values.length > 6)
        throw new RangeError("Donut charts support up to six parts.");
      chartSum(values);
    } else {
      chartMaximum(values, props.max);
      if (
        props.type === "funnel" &&
        values.some((value, i) => i > 0 && value > values[i - 1])
      )
        throw new RangeError("Funnel stages must be in non-increasing order.");
    }
  }
}

export function chartTable(props: ChartProps): {
  columns: string[];
  rows: string[][];
} {
  const format = props.formatValue ?? formatChartValue;
  const category = props.categoryLabel ?? "Category";
  const value = props.valueLabel ?? "Value";
  if (props.type === "goal")
    return {
      columns: ["Measure", value],
      rows: [
        [props.label, format(props.value)],
        ["Maximum", format(props.max)],
        ...(props.target === undefined
          ? []
          : [["Target", format(props.target)]]),
      ],
    };
  if (props.type === "scatter")
    return {
      columns: [category, props.xLabel, props.yLabel],
      rows: props.data.map((p) => [p.label, format(p.x), format(p.y)]),
    };
  if (props.type === "heatmap" || props.type === "stacked-bar")
    return {
      columns: [
        category,
        ...(props.type === "heatmap" ? props.columns : props.series),
      ],
      rows: props.data.map((row) => [row.label, ...row.values.map(format)]),
    };
  return {
    columns: [category, value],
    rows: [
      ...(props.type === "metric" ? [[props.label, format(props.value)]] : []),
      ...props.data.map((row) => [row.label, format(row.value)]),
    ],
  };
}
