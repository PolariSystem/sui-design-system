import type { ComponentPropsWithRef, ReactNode } from "react";

export interface ButtonProps extends ComponentPropsWithRef<"button"> {
  variant?: "primary" | "secondary" | "tertiary" | "danger";
  size?: "sm" | "md" | "lg";
  /** Uses compact padding for a decorative icon child. Supply aria-label for its action. */
  iconOnly?: boolean;
  /** Prevents activation and exposes aria-busy while an action is pending. */
  loading?: boolean;
  /** Replaces the visible and accessible label while loading; localize at the call site. */
  loadingLabel?: string;
  /** Decorative content only. The button label supplies its accessible name. */
  leftIcon?: ReactNode;
  /** Decorative content only; do not nest another interactive control here. */
  rightIcon?: ReactNode;
}

// Keep complete utility names so Tailwind can discover every variant at build time.
// Hover, press and keyboard focus remain browser states rather than simulated props.
const variants = {
  primary:
    "border-sui-action-primary-default bg-sui-action-primary-default text-sui-action-primary-foreground enabled:hover:bg-sui-action-primary-hover enabled:active:bg-sui-action-primary-pressed",
  secondary:
    "border-sui-border-default bg-sui-action-secondary-default text-sui-action-secondary-foreground enabled:hover:bg-sui-action-secondary-hover enabled:active:bg-sui-action-secondary-pressed",
  tertiary:
    "border-transparent bg-transparent text-sui-action-secondary-foreground enabled:hover:bg-sui-action-secondary-hover enabled:active:bg-sui-action-secondary-pressed",
  danger:
    "border-sui-action-danger-default bg-sui-action-danger-default text-sui-action-danger-foreground enabled:hover:bg-sui-action-danger-hover enabled:active:bg-sui-action-danger-pressed",
};
const sizes = {
  sm: "min-h-sui-size-control-sm",
  md: "min-h-sui-size-control-md",
  lg: "min-h-sui-size-control-lg",
};

/**
 * Native action button. Defaults to type="button" to avoid accidental form submission.
 * Minimum heights preserve the Figma sizes while allowing enlarged text to grow.
 */
export function Button({
  variant = "primary",
  size = "md",
  iconOnly = false,
  loading = false,
  loadingLabel = "Loading",
  leftIcon,
  rightIcon,
  children,
  disabled,
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      data-variant={variant}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`sui-button inline-flex min-w-10 max-w-full items-center justify-center gap-2 rounded-sui-control border py-0 font-sui text-sui-label-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sui-border-focus focus-visible:shadow-sui-focus-default disabled:cursor-not-allowed disabled:opacity-(--sui-opacity-disabled) ${iconOnly ? "px-2" : "px-4"} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="sui-spinner size-4 shrink-0 rounded-full border-2 border-current border-r-transparent motion-safe:animate-spin"
        />
      ) : (
        leftIcon && (
          <span
            aria-hidden="true"
            className="inline-flex size-4 shrink-0 items-center justify-center"
          >
            {leftIcon}
          </span>
        )
      )}
      <span
        className={
          iconOnly ? (loading ? "sr-only" : "inline-flex shrink-0") : undefined
        }
      >
        {loading ? loadingLabel : children}
      </span>
      {!loading && rightIcon && (
        <span
          aria-hidden="true"
          className="inline-flex size-4 shrink-0 items-center justify-center"
        >
          {rightIcon}
        </span>
      )}
    </button>
  );
}
