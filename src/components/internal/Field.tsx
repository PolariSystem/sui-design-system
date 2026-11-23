import { useId, type ReactNode } from "react";

export interface FieldProps {
  label: string;
  hideLabel?: boolean;
  helperText?: string;
  error?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

interface FieldControl {
  id: string;
  "aria-describedby": string | undefined;
}

/** Shared label/message wiring; each control retains its own native semantics. */
export function Field({
  label,
  hideLabel,
  helperText,
  error,
  id,
  required,
  disabled,
  className = "",
  describedBy,
  children,
  labelTone = "primary",
}: FieldProps & {
  describedBy?: string;
  labelTone?: "primary" | "body";
  children: (control: FieldControl) => ReactNode;
}) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  // Errors replace guidance, but caller-owned descriptions remain associated.
  const message = error || helperText;
  const description =
    [describedBy, message ? `${controlId}-message` : null]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <div
      className={`sui-field flex min-w-32 flex-col gap-2 font-sui ${className}`}
    >
      <label
        htmlFor={controlId}
        className={`${hideLabel ? "sr-only" : "text-sui-label-md"} ${disabled ? "text-sui-text-disabled" : labelTone === "body" ? "text-sui-text-body" : "text-sui-text-primary"}`}
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-sui-text-danger">
            *
          </span>
        )}
      </label>
      {children({ id: controlId, "aria-describedby": description })}
      {message && (
        <p
          id={`${controlId}-message`}
          className={`text-sui-caption-md ${error ? "text-sui-text-danger" : "text-sui-text-secondary"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
