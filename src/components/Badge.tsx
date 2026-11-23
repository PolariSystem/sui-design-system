import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  size?: "sm" | "md";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}
const tones = {
  neutral: "bg-sui-surface-muted text-sui-text-secondary",
  info: "bg-sui-status-info-background text-sui-status-info-foreground",
  success:
    "bg-sui-status-success-background text-sui-status-success-foreground",
  warning:
    "bg-sui-status-warning-background text-sui-status-warning-foreground",
  danger: "bg-sui-status-danger-background text-sui-status-danger-foreground",
};
/**
 * Noninteractive status label. Tone complements its text, never replaces it.
 * Live announcements belong to the consuming flow, so no role="status" is added here.
 */
export function Badge({
  tone = "neutral",
  size = "sm",
  leftIcon,
  rightIcon,
  children,
  className = "",
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={`sui-badge inline-flex max-w-full items-center justify-center gap-2 rounded-sui-full px-2 font-sui text-sui-label-sm ${size === "sm" ? "min-h-6" : "min-h-7"} ${tones[tone]} ${className}`}
    >
      {leftIcon && (
        <span aria-hidden="true" className="inline-flex size-4 shrink-0">
          {leftIcon}
        </span>
      )}
      <span>{children}</span>
      {rightIcon && (
        <span aria-hidden="true" className="inline-flex size-4 shrink-0">
          {rightIcon}
        </span>
      )}
    </span>
  );
}
