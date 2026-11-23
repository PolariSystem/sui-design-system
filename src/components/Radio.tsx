import type { ComponentPropsWithRef, ReactNode } from "react";
import selected from "../assets/radio-selected.svg";
import selectedFocus from "../assets/radio-selected-focus.svg";
import selectedDisabled from "../assets/radio-selected-disabled.svg";

export interface RadioProps extends Omit<
  ComponentPropsWithRef<"input">,
  "type" | "size" | "children"
> {
  label: ReactNode;
  hideLabel?: boolean;
}

/** Use a shared name within a fieldset/legend for native exclusive selection and arrow keys. */
export function Radio({
  label,
  hideLabel,
  disabled,
  className = "",
  ...props
}: RadioProps) {
  return (
    <label
      className={`sui-radio inline-flex items-start gap-2 font-sui text-sui-label-md ${disabled ? "cursor-not-allowed text-sui-text-disabled" : "cursor-pointer text-sui-text-primary"} ${className}`}
    >
      <span className="relative inline-flex size-5 shrink-0">
        <input
          {...props}
          type="radio"
          disabled={disabled}
          className="absolute inset-0 z-10 m-0 size-5 cursor-[inherit] opacity-0"
        />
        <span
          aria-hidden="true"
          className="sui-radio-empty absolute inset-0 rounded-sui-full border border-sui-border-control bg-sui-surface-default"
        />
        <img
          src={disabled ? selectedDisabled : selected}
          alt=""
          aria-hidden="true"
          className="sui-radio-selected pointer-events-none absolute inset-0 opacity-0"
        />
        {!disabled && (
          <img
            src={selectedFocus}
            alt=""
            aria-hidden="true"
            className="sui-radio-focus pointer-events-none absolute inset-0 opacity-0"
          />
        )}
      </span>
      <span className={hideLabel ? "sr-only" : undefined}>{label}</span>
    </label>
  );
}
