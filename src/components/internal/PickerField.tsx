import { AssetIcon } from "./AssetIcon";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Field, type FieldProps } from "./Field";
import { PickerSurface } from "./PickerSurface";

export interface PickerFieldProps extends FieldProps {
  name?: string;
  form?: string;
  readOnly?: boolean;
  placeholder?: string;
  "aria-describedby"?: string;
}
/** A button provides the visible control; the native bridge preserves submission and required validation. */
export function PickerField({
  displayValue,
  serializedValue,
  validationMessage = "",
  icon,
  open,
  onOpenChange,
  inputRef,
  children,
  placeholder = "Choose a value",
  name,
  form,
  readOnly,
  disabled,
  required,
  "aria-describedby": describedBy,
  ...field
}: PickerFieldProps & {
  displayValue: string;
  serializedValue: string;
  validationMessage?: string;
  icon: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  children: ReactNode;
}) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const requiredId = useId();
  const [invalid, setInvalid] = useState(false);
  const error =
    field.error ||
    (invalid ? validationMessage || "Choose a value." : undefined);
  useEffect(() => setInvalid(false), [serializedValue]);
  useEffect(() => {
    const owner = inputRef.current?.form;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (!event.defaultPrevented) setInvalid(false);
      });
    owner?.addEventListener("reset", reset);
    return () => owner?.removeEventListener("reset", reset);
  }, [inputRef, form]);
  useEffect(() => {
    inputRef.current?.setCustomValidity(
      readOnly || disabled ? "" : validationMessage,
    );
  }, [inputRef, validationMessage, readOnly, disabled]);
  return (
    <Field
      {...field}
      error={error}
      disabled={disabled}
      required={required}
      describedBy={
        [describedBy, required ? requiredId : undefined]
          .filter(Boolean)
          .join(" ") || undefined
      }
    >
      {(control) => (
        <>
          {required && (
            <span id={requiredId} className="sr-only">
              Required
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            aria-hidden="true"
            tabIndex={-1}
            className="sr-only"
            name={name}
            form={form}
            value={serializedValue}
            onChange={() => {}}
            required={required && !readOnly}
            disabled={disabled}
            onFocus={() => triggerRef.current?.focus()}
            onInvalid={(event) => {
              event.preventDefault();
              setInvalid(true);
              triggerRef.current?.focus();
            }}
          />
          <PickerSurface
            label={field.label}
            open={open && !disabled && !readOnly}
            onOpenChange={(next) => {
              if (!disabled && !readOnly) onOpenChange(next);
            }}
            trigger={
              <button
                {...control}
                ref={triggerRef}
                type="button"
                disabled={disabled}
                aria-invalid={Boolean(error || validationMessage) || undefined}
                aria-disabled={readOnly || undefined}
                data-readonly={Boolean(readOnly)}
                data-disabled={Boolean(disabled)}
                data-error={Boolean(error || validationMessage)}
                className="sui-input-control sui-picker-trigger flex min-h-11 w-full items-center gap-2 rounded-sui-control border border-sui-border-control bg-sui-surface-default px-3 py-2 text-start text-sui-body-md text-sui-text-primary"
              >
                <span
                  className={`min-w-0 flex-1 break-words ${displayValue ? "" : "text-sui-text-secondary"}`}
                >
                  {displayValue || placeholder}
                </span>
                <AssetIcon src={icon} />
              </button>
            }
          >
            {children}
          </PickerSurface>
        </>
      )}
    </Field>
  );
}
