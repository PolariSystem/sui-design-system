import type { ComponentPropsWithRef, ReactNode } from "react";
import { Field } from "./internal/Field";

export interface InputProps extends Omit<
  ComponentPropsWithRef<"input">,
  "size"
> {
  label: string;
  /** Visually hides the label while keeping the input programmatically named. */
  hideLabel?: boolean;
  helperText?: string;
  error?: string;
  size?: "compact" | "standard";
  /** Decorative slots must not contain focusable controls. */
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/** Labeled native input; className styles the wrapper and ref reaches the input. */
export function Input(props: InputProps) {
  return <InputField {...props} />;
}

// Internal composition point: interactive actions never enter an aria-hidden icon slot.
export function InputField({
  label,
  hideLabel,
  helperText,
  error,
  size = "standard",
  leftIcon,
  rightIcon,
  id,
  required,
  disabled,
  readOnly,
  className,
  trailingAction,
  "aria-describedby": describedBy,
  ...props
}: InputProps & { trailingAction?: ReactNode }) {
  return (
    <Field
      {...{
        label,
        hideLabel,
        helperText,
        error,
        id,
        required,
        disabled,
        className,
        describedBy,
      }}
    >
      {(control) => (
        <div
          data-error={Boolean(error)}
          data-disabled={Boolean(disabled)}
          data-readonly={Boolean(readOnly)}
          className={`sui-input-control flex min-w-0 items-center gap-2 rounded-sui-control border border-sui-border-control bg-sui-surface-default px-3 ${size === "compact" ? "min-h-10" : "min-h-11"}`}
        >
          {leftIcon && (
            <span
              aria-hidden="true"
              className="flex size-5 shrink-0 items-center justify-center"
            >
              {leftIcon}
            </span>
          )}
          <input
            {...props}
            {...control}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={error ? true : props["aria-invalid"]}
            className="min-w-0 flex-1 bg-transparent py-2 font-sui text-sui-body-md text-sui-text-primary outline-none placeholder:text-sui-text-muted disabled:cursor-not-allowed disabled:text-sui-text-disabled"
          />
          {rightIcon && (
            <span
              aria-hidden="true"
              className="flex size-5 shrink-0 items-center justify-center"
            >
              {rightIcon}
            </span>
          )}
          {trailingAction}
        </div>
      )}
    </Field>
  );
}
