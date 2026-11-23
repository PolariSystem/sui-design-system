import { useMemo } from "react";
import type { ChartProps } from "./Chart.types";
import { ChartPlot } from "./internal/ChartPlots";
import { chartTable, validateChart } from "./internal/chart-data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./Table";
import { EmptyState } from "./EmptyState";
import { useChartProgress } from "./internal/useChartProgress";

export type {
  ChartProps,
  ChartDatum,
  ChartMatrixRow,
  ChartPoint,
} from "./Chart.types";

function AnimatedPlot({ props }: { props: ChartProps }) {
  // Keep serialization out of animation frames; parents may recreate equivalent data arrays.
  const data = useMemo(
    () =>
      JSON.stringify({
        ...props,
        animationKey: undefined,
        className: undefined,
        showDataTable: undefined,
      }),
    [props],
  );
  const { ref, progress } = useChartProgress({
    key: props.animationKey,
    // Ordinary data edits finish immediately; an explicit replay key restarts from zero.
    data,
    enabled: props.animated !== false,
  });
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="sui-chart-value-plot"
      data-progress={progress}
    >
      <ChartPlot props={props} progress={progress} />
    </div>
  );
}

/** Responsive, zero-based visualizations with an always-available semantic data alternative. */
export function Chart(props: ChartProps) {
  validateChart(props);
  const empty =
    props.type !== "goal" && props.type !== "metric" && !props.data.length;
  const data = chartTable(props);
  const tableLabel = props.dataTableLabel ?? `${props.label} data`;
  // Decorative plot markup must not hide contextual meaning from the text alternative.
  const context =
    props.type === "metric"
      ? props.comparison
      : props.type === "goal"
        ? props.summary
        : props.type === "donut"
          ? props.unit
          : "note" in props
            ? props.note
            : undefined;
  const contents = (
    <>
      <TableHeader>
        <TableRow>
          {data.columns.map((column, i) => (
            <TableHead key={i}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.rows.map((row, i) => (
          <TableRow key={i}>
            {row.map((cell, j) => (
              <TableCell key={j}>{cell}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </>
  );
  return (
    <figure
      aria-label={props.label}
      className={`sui-chart min-w-0 w-full font-sui text-sui-text-primary ${props.className ?? ""}`}
    >
      <figcaption className="sr-only">
        {[props.description ?? props.label, context].filter(Boolean).join(". ")}
      </figcaption>
      {empty ? (
        <EmptyState
          variant="subtle"
          title={props.emptyLabel ?? "No data yet"}
          description={
            props.emptyDescription ?? "Data will appear here when available."
          }
        />
      ) : (
        <AnimatedPlot props={props} />
      )}
      {/* Clip a block wrapper: a table's intrinsic column widths can exceed a 1px sr-only width.
          The semantic table remains available without creating an invisible keyboard stop. */}
      {!empty &&
        (props.showDataTable ? (
          <div className="mt-4">
            <Table label={tableLabel}>{contents}</Table>
          </div>
        ) : (
          <div className="sr-only">
            <table>
              <caption>{tableLabel}</caption>
              {contents}
            </table>
          </div>
        ))}
    </figure>
  );
}
