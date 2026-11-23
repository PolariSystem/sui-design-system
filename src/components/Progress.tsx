import { useId, type ComponentPropsWithoutRef } from "react";

export interface ProgressProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> {
  label: string;
  /** Omit value for indeterminate work. Data proportions are not rounded to the spacing grid. */
  value?: number;
  max?: number;
  error?: boolean;
  valueLabel?: string;
  workingLabel?: string;
}

/** Values update immediately. The track reveals once; indeterminate decoration loops separately. */
export function Progress({
  label,
  value,
  max = 100,
  error = false,
  valueLabel,
  workingLabel = "Working…",
  className = "",
  ...props
}: ProgressProps) {
  const id = useId();
  const maximum = Number.isFinite(max) && max > 0 ? max : 100;
  const current =
    value !== undefined && Number.isFinite(value)
      ? Math.max(0, Math.min(value, maximum))
      : undefined;
  const fraction = current === undefined ? undefined : current / maximum;
  const state = error
    ? "error"
    : fraction === 1
      ? "complete"
      : fraction === undefined
        ? "indeterminate"
        : "default";
  const description =
    valueLabel ??
    (fraction === undefined ? workingLabel : `${Math.round(fraction * 100)}%`);
  return (
    <div
      className={`sui-progress flex min-w-0 flex-col gap-2 font-sui ${className}`}
      data-state={state}
    >
      <div className="flex items-center gap-2">
        <span
          id={id}
          className="min-w-0 flex-1 text-sui-label-md text-sui-text-primary"
        >
          {label}
        </span>
        <span className="text-end text-sui-caption-md text-sui-text-secondary">
          {description}
        </span>
      </div>
      <div
        {...props}
        role="progressbar"
        aria-labelledby={
          props["aria-labelledby"] ?? (props["aria-label"] ? undefined : id)
        }
        aria-valuemin={0}
        aria-valuemax={maximum}
        aria-valuenow={current}
        aria-valuetext={description}
        className="sui-progress-track sui-chart-appear h-2 overflow-hidden rounded-sui-chart-bar bg-sui-chart-track"
      >
        <div
          aria-hidden="true"
          className="sui-progress-fill h-full rounded-sui-chart-bar bg-sui-action-primary-default"
          style={{
            width: fraction === undefined ? "40%" : `${fraction * 100}%`,
          }}
        />
      </div>
    </div>
  );
}
