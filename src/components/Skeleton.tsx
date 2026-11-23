import type { ComponentPropsWithoutRef } from "react";
import { Card } from "./Card";

export interface SkeletonProps extends ComponentPropsWithoutRef<"div"> {
  shape?: "row" | "metric" | "card";
  loadingLabel?: string;
  description?: string;
}
function Row() {
  return (
    <div
      aria-hidden="true"
      className="sui-skeleton-decoration flex w-full min-w-0 items-center gap-3"
    >
      <span className="size-8 shrink-0 rounded-sui-lg bg-sui-surface-disabled" />
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="h-3 w-full max-w-[316px] rounded-sui-control bg-sui-surface-disabled" />
        <span className="h-2 w-3/4 max-w-60 rounded-sui-xs bg-sui-surface-canvas" />
      </span>
    </div>
  );
}

/** Decoration is hidden from assistive technology. The containing result region owns aria-busy. */
export function Skeleton({
  shape = "row",
  loadingLabel = "Loading your records",
  description = "Reserve space while content loads.",
  className = "",
  ...props
}: SkeletonProps) {
  if (shape === "card")
    return (
      <Card
        {...props}
        padding="comfortable"
        className={`sui-skeleton gap-5 ${className}`}
      >
        <p className="text-sui-heading-xs">{loadingLabel}</p>
        <Row />
        <Row />
        <Row />
        <p className="text-sui-caption-md text-sui-text-secondary">
          {description}
        </p>
      </Card>
    );
  return (
    <div
      {...props}
      aria-hidden="true"
      className={`sui-skeleton min-w-0 ${className}`}
    >
      {shape === "metric" ? (
        <div className="sui-skeleton-decoration h-7 w-20 max-w-full rounded-sui-xs bg-sui-chart-skeleton" />
      ) : (
        <Row />
      )}
    </div>
  );
}
