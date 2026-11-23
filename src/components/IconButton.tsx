import type { ReactNode } from "react";
import { Button, type ButtonProps } from "./Button";

export interface IconButtonProps extends Omit<
  ButtonProps,
  "children" | "iconOnly" | "leftIcon" | "rightIcon" | "aria-label"
> {
  /** Describes the action, rather than the icon's appearance. Localize at the call site. */
  "aria-label": string;
  /** A decorative Solar Bold icon; do not nest interactive content. */
  icon: ReactNode;
}

/** Square action control sharing Button's native semantics, states and motion policy. */
export function IconButton({
  icon,
  size = "md",
  variant = "tertiary",
  className = "",
  ...props
}: IconButtonProps) {
  return (
    <Button
      {...props}
      size={size}
      variant={variant}
      iconOnly
      data-size={size}
      data-variant={variant}
      className={`sui-icon-button ${className}`}
    >
      {/* The action's name remains stable when the icon becomes a loading indicator. */}
      <span aria-hidden="true" className="sui-icon-button-icon">
        {icon}
      </span>
    </Button>
  );
}
