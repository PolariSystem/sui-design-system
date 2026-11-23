import type { ChartDatum, ChartProps } from "../Chart.types";
import { chartMaximum, chartSum, formatChartValue } from "./chart-data";

export const seriesColor = (index: number) =>
  `var(--sui-color-chart-series-${index + 1})`;
// Counters keep integer datasets readable and preserve exact final values/formatters.
const count = (value: number, progress: number) =>
  progress === 1
    ? value
    : Number.isInteger(value)
      ? Math.round(value * progress)
      : value * progress;
const percent = (value: number, total: number) =>
  total ? (value / total) * 100 : 0;
const percentage = (value: number, total: number) =>
  `${formatChartValue(percent(value, total))}%`;
const seriesForeground = (index: number) =>
  `var(--sui-color-chart-foreground-${index + 1})`;

/** Only data geometry scales. Labels and point diameters stay in CSS pixels as the plot resizes. */
function LineMarks({
  data,
  max,
  area = false,
  dots = true,
  progress = 1,
}: {
  data: readonly ChartDatum[];
  max: number;
  area?: boolean;
  dots?: boolean;
  progress?: number;
}) {
  const points = data.map((d, i) => ({
    id: d.id,
    x: data.length === 1 ? 50 : (i / (data.length - 1)) * 100,
    y: 100 - (d.value / max) * 100 * progress,
  }));
  const path = points.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  return (
    <>
      <svg
        className="sui-chart-vector"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        focusable="false"
      >
        {area && points.length > 1 && (
          <path
            d={`${path} L100,100 L0,100 Z`}
            fill="var(--sui-color-data-area)"
          />
        )}
        <path
          d={path}
          fill="none"
          stroke={seriesColor(0)}
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {(dots || points.length === 1) &&
        points.map((p) => (
          <span
            key={p.id}
            className="sui-chart-point"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
          />
        ))}
    </>
  );
}

function Cartesian({
  props,
  progress,
}: {
  progress: number;
  props:
    | Extract<ChartProps, { type: "scatter" }>
    | Extract<
        ChartProps,
        {
          type:
            | "line"
            | "area"
            | "column"
            | "histogram"
            | "horizontal-bar"
            | "funnel";
        }
      >;
}) {
  const format = props.formatValue ?? formatChartValue;
  const scatter = props.type === "scatter";
  const values = scatter
    ? props.data.map((p) => p.y)
    : props.data.map((p) => p.value);
  const max = chartMaximum(values, scatter ? props.yMax : props.max);
  const xMax = scatter
    ? chartMaximum(
        props.data.map((p) => p.x),
        props.xMax,
      )
    : 1;
  const bars = props.type === "column" || props.type === "histogram";
  const labels = scatter
    ? [format(0), format(xMax / 2), format(xMax)]
    : props.data.map((p) => p.label);
  return (
    <div className="sui-cartesian" data-bars={bars} data-scatter={scatter}>
      <div className="sui-chart-y-axis text-sui-chart-axis">
        {[max, max / 2, 0].map((v, i) => (
          <span key={i}>{format(v)}</span>
        ))}
      </div>
      <div className="sui-chart-coordinates">
        {scatter && <p className="text-sui-chart-axis">{props.yLabel}</p>}
        <div className="sui-chart-gridplot">
          {[0, 50, 100].map((position) => (
            <span
              key={position}
              className="sui-chart-gridline"
              style={{ top: `${position}%` }}
            />
          ))}
          {scatter ? (
            props.data.map((p) => (
              <span
                key={p.id}
                className="sui-chart-point sui-chart-point-scatter"
                style={{
                  left: `${(p.x / xMax) * 100 * progress}%`,
                  top: `${100 - (p.y / max) * 100 * progress}%`,
                }}
              />
            ))
          ) : bars ? (
            <div
              className="sui-chart-columns"
              data-histogram={props.type === "histogram"}
            >
              {props.data.map((d) => (
                <div key={d.id} className="sui-chart-column">
                  <span
                    className="sui-chart-column-value text-sui-chart-value"
                    style={{
                      bottom: `calc(${(d.value / max) * 100 * progress}% + 4px)`,
                    }}
                  >
                    {format(count(d.value, progress))}
                  </span>
                  <div
                    className="sui-chart-bar"
                    style={{ height: `${(d.value / max) * 100 * progress}%` }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <LineMarks
              data={props.data}
              max={max}
              area={props.type === "area"}
              progress={progress}
            />
          )}
        </div>
        <div
          className="sui-chart-x-axis text-sui-chart-axis"
          data-bars={bars}
          data-histogram={props.type === "histogram"}
        >
          {labels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
        {scatter && (
          <p className="text-center text-sui-chart-axis">{props.xLabel}</p>
        )}
      </div>
    </div>
  );
}

function Horizontal({
  props,
  progress,
}: {
  progress: number;
  props: Extract<
    ChartProps,
    {
      type:
        "line" | "area" | "column" | "histogram" | "horizontal-bar" | "funnel";
    }
  >;
}) {
  const format = props.formatValue ?? formatChartValue;
  const max = chartMaximum(
    props.data.map((d) => d.value),
    props.max,
  );
  const funnel = props.type === "funnel";
  return (
    <div className="sui-chart-horizontal" data-funnel={funnel}>
      {props.data.map((d, i) => (
        <div key={d.id} className="sui-chart-horizontal-row">
          <span className="text-sui-chart-axis">{d.label}</span>
          <div className="sui-chart-horizontal-volume">
            <div
              className="sui-chart-bar"
              style={{
                width: `${(d.value / max) * 100 * progress}%`,
                background: seriesColor(funnel ? Math.min(i, 2) : 0),
              }}
            />
            {!funnel && (
              <span className="text-sui-chart-value">
                {format(count(d.value, progress))}
              </span>
            )}
          </div>
          {funnel && (
            <span className="text-sui-caption-sm">
              {format(count(d.value, progress))}
            </span>
          )}
        </div>
      ))}
      {props.note && <p className="text-sui-chart-axis">{props.note}</p>}
    </div>
  );
}

export function ChartPlot({
  props,
  progress = 1,
}: {
  props: ChartProps;
  progress?: number;
}) {
  const format = props.formatValue ?? formatChartValue;
  switch (props.type) {
    case "line":
    case "area":
    case "column":
    case "histogram":
    case "scatter":
      return <Cartesian props={props} progress={progress} />;
    case "horizontal-bar":
    case "funnel":
      return <Horizontal props={props} progress={progress} />;
    case "metric":
      return (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-sui-chart-metric">
              {format(count(props.value, progress))}
            </p>
            {props.comparison && (
              <p
                className="text-sui-label-sm"
                style={{
                  color: `var(--sui-color-text-${props.comparisonTone === "success" ? "success" : props.comparisonTone === "danger" ? "danger" : "secondary"})`,
                }}
              >
                {props.comparison}
              </p>
            )}
          </div>
          {props.data.length > 0 && (
            <div className="sui-chart-sparkline">
              <div className="sui-chart-sparkline-plot">
                <LineMarks
                  data={props.data}
                  max={chartMaximum(props.data.map((d) => d.value))}
                  dots={false}
                  progress={progress}
                />
              </div>
            </div>
          )}
        </div>
      );
    case "goal":
      return (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <p className="text-sui-chart-goal">
              {format(count(props.value, progress))} / {format(props.max)}
            </p>
            <p className="text-sui-caption-md text-sui-text-secondary">
              {props.summary ??
                `${percentage(props.value * progress, props.max)} complete${props.target === undefined ? "" : ` · target ${format(props.target)}`}`}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="sui-chart-goal">
              <div className="sui-chart-goal-track" />
              <div
                className="sui-chart-bar"
                style={{
                  width: `${percent(props.value * progress, props.max)}%`,
                }}
              />
              {props.target !== undefined && (
                <span
                  className="sui-chart-goal-target"
                  style={{
                    left: `clamp(1px, ${percent(props.target, props.max)}%, calc(100% - 1px))`,
                  }}
                />
              )}
            </div>
            <div className="flex justify-between text-sui-chart-axis">
              {[0, props.max / 2, props.max].map((v, i) => (
                <span key={i}>{format(v)}</span>
              ))}
            </div>
          </div>
        </div>
      );
    case "donut": {
      const total = chartSum(props.data.map((d) => d.value));
      let offset = 0;
      return (
        <div className="sui-chart-donut">
          <div className="sui-chart-ring">
            <svg
              viewBox="0 0 128 128"
              width="128"
              height="128"
              focusable="false"
            >
              <circle
                cx="64"
                cy="64"
                r="56"
                fill="none"
                stroke="var(--sui-color-chart-track)"
                strokeWidth="16"
              />
              {props.data.map((d, i) => {
                const share = percent(d.value, total) * progress;
                const start = offset;
                offset += share;
                return (
                  d.value > 0 && (
                    <circle
                      key={d.id}
                      cx="64"
                      cy="64"
                      r="56"
                      pathLength="100"
                      fill="none"
                      stroke={seriesColor(i)}
                      strokeWidth="16"
                      strokeDasharray={`${share} ${100 - share}`}
                      strokeDashoffset={-start}
                      transform="rotate(-90 64 64)"
                    />
                  )
                );
              })}
            </svg>
            <div className="sui-chart-total">
              <span className="text-sui-chart-donut">
                {format(count(total, progress))}
              </span>
              <span className="text-sui-caption-sm text-sui-text-secondary">
                {props.unit}
              </span>
            </div>
          </div>
          <ul className="sui-chart-legend">
            {props.data.map((d, i) => (
              <li key={d.id}>
                <span
                  className="sui-chart-key"
                  style={{ background: seriesColor(i) }}
                />
                {d.label} · {percentage(d.value * progress, total)}
              </li>
            ))}
          </ul>
        </div>
      );
    }
    case "stacked-bar":
      return (
        <div className="flex flex-col gap-2">
          {props.data.map((row) => {
            const total = chartSum(row.values);
            return (
              <div key={row.id} className="flex flex-col gap-2">
                <p className="text-sui-chart-axis">{row.label}</p>
                <div className="sui-chart-stack">
                  {row.values.map((value, i) => (
                    <span
                      key={props.series[i]}
                      className="text-sui-chart-value"
                      style={{
                        width: `${percent(value * progress, total)}%`,
                        background: seriesColor(i),
                        color: seriesForeground(i),
                      }}
                    >
                      <span>{percentage(value * progress, total)}</span>
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    case "heatmap": {
      const max = chartMaximum(
        props.data.flatMap((r) => [...r.values]),
        props.max,
      );
      return (
        <div className="flex flex-col gap-2">
          <div
            className="sui-chart-heatmap"
            style={{
              gridTemplateColumns: `max-content repeat(${props.columns.length}, minmax(0, 1fr))`,
            }}
          >
            <span />
            {props.columns.map((c) => (
              <span key={c} className="text-sui-chart-axis text-center">
                {c}
              </span>
            ))}
            {props.data.map((row) => (
              <div key={row.id} className="contents">
                <span className="text-sui-chart-axis">{row.label}</span>
                {row.values.map((v, i) => (
                  <span
                    key={i}
                    className="sui-chart-heatcell text-sui-chart-value"
                    data-level={
                      (v * progress) / max > 2 / 3
                        ? "high"
                        : (v * progress) / max > 1 / 3
                          ? "medium"
                          : "low"
                    }
                  >
                    {format(count(v, progress))}
                  </span>
                ))}
              </div>
            ))}
          </div>
          {props.note && <p className="text-sui-chart-axis">{props.note}</p>}
        </div>
      );
    }
  }
}
