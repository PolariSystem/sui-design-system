import type { ComponentPropsWithRef, ReactNode } from "react";

export interface SwitchProps extends Omit<
  ComponentPropsWithRef<"input">,
  "type" | "size" | "children" | "role" | "aria-checked"
> {
  label: ReactNode;
  hideLabel?: boolean;
}

/** Native checkbox semantics; CSS moves the thumb without delaying the checked state. */
export function Switch({
  label,
  hideLabel,
  disabled,
  className = "",
  ...props
}: SwitchProps) {
  return (
    <label
      className={`sui-switch inline-flex items-center gap-2 font-sui text-sui-label-md ${disabled ? "cursor-not-allowed text-sui-text-disabled" : "cursor-pointer text-sui-text-primary"} ${className}`}
    >
      <span className="relative inline-flex h-sui-size-switch-height w-sui-size-switch-width shrink-0">
        <input
          {...props}
          type="checkbox"
          role="switch"
          disabled={disabled}
          className="absolute inset-0 z-10 m-0 h-sui-size-switch-height w-sui-size-switch-width cursor-[inherit] opacity-0"
        />
        {/* Separate track and thumb preserve Figma geometry while allowing continuous motion. */}
        <span
          aria-hidden="true"
          className="sui-switch-track pointer-events-none absolute inset-0 rounded-sui-full"
        >
          <span className="sui-switch-thumb absolute rounded-sui-full" />
        </span>
      </span>
      <span className={hideLabel ? "sr-only" : undefined}>{label}</span>
    </label>
  );
}
