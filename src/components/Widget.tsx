import { useId, type ReactNode } from "react";
import { Card, CardFooter } from "./Card";
import { Chart, type ChartProps } from "./Chart";
import { Skeleton } from "./Skeleton";

export interface WidgetProps {
  title: string;
  description?: string;
  chart: ChartProps;
  /** Compose the existing DropdownMenu or Button here. Actions stay at the right of the header. */
  actions?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  error?: ReactNode;
  recovery?: ReactNode;
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/** Data presentation is independent of fetching; the owner supplies loading, errors and recovery. */
export function Widget({
  title,
  description,
  chart,
  actions,
  footer,
  loading = false,
  loadingLabel = "Loading widget",
  error,
  recovery,
  headingLevel = 3,
  className = "",
}: WidgetProps) {
  const headingId = useId();
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  return (
    <section
      aria-labelledby={headingId}
      aria-busy={loading}
      className={`sui-widget min-w-0 ${className}`}
    >
      <Card className="sui-widget-card">
        <header className="flex min-w-0 items-center gap-2">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Heading id={headingId} className="text-sui-widget-title">
              {title}
            </Heading>
            {description && (
              <p className="text-sui-caption-sm text-sui-text-secondary">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </header>
        {loading ? (
          <>
            <span role="status" className="sr-only">
              {loadingLabel}
            </span>
            <Skeleton shape="card" />
          </>
        ) : error ? (
          <>
            <div
              role="alert"
              className="text-sui-body-sm text-sui-text-secondary"
            >
              {error}
            </div>
            {recovery && <CardFooter>{recovery}</CardFooter>}
          </>
        ) : (
          <Chart {...chart} />
        )}
        {footer && !loading && !error && (
          <div className="sui-widget-footer">{footer}</div>
        )}
      </Card>
    </section>
  );
}

export interface KPIWidgetProps {
  title: string;
  value: string;
  comparison?: string;
  className?: string;
}

/** Compact approved headline card; comparison is explicit copy rather than an inferred trend. */
export function KPIWidget({
  title,
  value,
  comparison,
  className = "",
}: KPIWidgetProps) {
  return (
    <Card className={`sui-kpi ${className}`}>
      <h3 className="text-sui-body-sm text-sui-text-secondary">{title}</h3>
      <p className="text-sui-heading-lg">{value}</p>
      {comparison && (
        <p className="text-sui-caption-md text-sui-text-secondary">
          {comparison}
        </p>
      )}
    </Card>
  );
}
