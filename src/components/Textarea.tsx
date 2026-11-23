import type { ComponentPropsWithRef, ReactNode } from "react";
import { Field, type FieldProps } from "./internal/Field";

export interface TextareaProps
  extends ComponentPropsWithRef<"textarea">, FieldProps {
  /** Decorative content; omitted slots take no layout space. */
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/** Native multiline field. Content can grow vertically; manual resizing stays available. */
export function Textarea({
  label,
  hideLabel,
  helperText,
  error,
  id,
  required,
  disabled,
  readOnly,
  className,
  leftIcon,
  rightIcon,
  rows = 3,
  "aria-describedby": describedBy,
  ...props
}: TextareaProps) {
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
      labelTone="body"
    >
      {(control) => (
        <div
          data-error={Boolean(error)}
          data-disabled={Boolean(disabled)}
          data-readonly={Boolean(readOnly)}
          className="sui-input-control sui-textarea-control flex min-h-26 min-w-0 items-start gap-2 rounded-sui-control border border-sui-border-control bg-sui-surface-default p-3"
        >
          {leftIcon && (
            <span
              aria-hidden="true"
              className="flex size-4 shrink-0 items-center justify-center"
            >
              {leftIcon}
            </span>
          )}
          <textarea
            {...props}
            {...control}
            rows={rows}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            aria-invalid={error ? true : props["aria-invalid"]}
            className="sui-textarea min-w-0 flex-1 resize-y bg-transparent font-sui text-sui-body-md text-sui-text-body outline-none placeholder:text-sui-text-muted disabled:cursor-not-allowed disabled:text-sui-text-disabled"
          />
          {rightIcon && (
            <span
              aria-hidden="true"
              className="flex size-4 shrink-0 items-center justify-center"
            >
              {rightIcon}
            </span>
          )}
        </div>
      )}
    </Field>
  );
}
