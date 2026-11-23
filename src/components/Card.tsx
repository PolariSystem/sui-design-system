import type { ComponentPropsWithoutRef } from "react";

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  /** Padding variants retain compatibility and share the 16 px card spacing. */
  padding?: "compact" | "default" | "comfortable";
  elevation?: "subtle" | "floating";
}
const paddings = {
  compact: "p-4",
  default: "p-sui-padding-card",
  comfortable: "p-sui-padding-card",
};
/**
 * Surface primitive with content-driven height. Consumers provide headings and semantics.
 * Default subtle elevation separates cards from the canvas at every viewport size;
 * elevation alone does not turn this container into a dialog or an interactive widget.
 */
export function Card({
  padding = "default",
  elevation = "subtle",
  className = "",
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={`sui-card flex min-w-0 flex-col gap-2 rounded-sui-lg border border-sui-border-default bg-sui-surface-default font-sui text-sui-text-primary ${paddings[padding]} ${elevation === "floating" ? "shadow-sui-elevation-floating" : "shadow-sui-elevation-subtle"} ${className}`}
    />
  );
}

/**
 * Place the primary action first in the DOM for mobile reading and keyboard order.
 * Actions fill a vertical stack on mobile; desktop keeps the primary at the right.
 */
export function CardFooter({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      {...props}
      className={`sui-card-footer flex w-full flex-wrap items-center justify-end gap-2 ${className}`}
    />
  );
}
