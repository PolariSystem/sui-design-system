import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ComponentPropsWithRef,
} from "react";
import { Field, type FieldProps } from "./internal/Field";

export interface OTPInputProps
  extends
    Omit<
      ComponentPropsWithRef<"input">,
      | "type"
      | "size"
      | "children"
      | "value"
      | "defaultValue"
      | "onChange"
      | "maxLength"
      | "minLength"
      | "pattern"
      | "placeholder"
    >,
    FieldProps {
  /** Six ASCII digits at most. Keep this a string to preserve leading zeros. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const normalizeCode = (value: string) =>
  value.replace(/[^0-9]/g, "").slice(0, 6);

/**
 * One native input, six decorative cells: a single tab stop and one submitted value.
 * Native selection/deletion stays intact. Completing the code never submits a form.
 */
export function OTPInput({
  label,
  hideLabel,
  helperText,
  error,
  id,
  required,
  disabled,
  readOnly,
  className,
  ref,
  value,
  defaultValue = "",
  onValueChange,
  onPaste,
  onSelect,
  onClick,
  onFocus,
  autoComplete = "one-time-code",
  inputMode = "numeric",
  "aria-describedby": describedBy,
  ...props
}: OTPInputProps) {
  const input = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState(() =>
    normalizeCode(defaultValue),
  );
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const controlled = value !== undefined;
  const code = normalizeCode(value ?? internalValue);
  useImperativeHandle(ref, () => input.current!, []);

  const updateSelection = () => {
    setSelection({
      start: input.current?.selectionStart ?? 0,
      end: input.current?.selectionEnd ?? 0,
    });
  };
  const updateCode = (next: string) => {
    if (!controlled) setInternalValue(next);
    if (next !== code) onValueChange?.(next);
  };
  useEffect(() => {
    const form = input.current?.form;
    // Reset is handled after dispatch so a consuming form can cancel the native event.
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (!event.defaultPrevented) {
          if (!controlled) setInternalValue(normalizeCode(defaultValue));
          setSelection({ start: 0, end: 0 });
        }
      });
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [controlled, defaultValue, props.form]);

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
          className="sui-otp relative min-w-0"
          data-error={Boolean(error)}
          data-disabled={Boolean(disabled)}
          data-readonly={Boolean(readOnly)}
        >
          <input
            {...props}
            {...control}
            ref={input}
            type="text"
            dir="ltr"
            inputMode={inputMode}
            autoComplete={autoComplete}
            spellCheck={false}
            required={required}
            disabled={disabled}
            readOnly={readOnly}
            value={code}
            minLength={6}
            maxLength={6}
            pattern="[0-9]{6}"
            aria-invalid={error ? true : props["aria-invalid"]}
            className="sui-otp-input absolute inset-0 z-10 h-full w-full min-w-0 cursor-text border-0 bg-transparent font-sui text-sui-code-otp text-transparent caret-transparent outline-none disabled:cursor-not-allowed"
            onChange={(event) => {
              updateCode(normalizeCode(event.currentTarget.value));
              updateSelection();
            }}
            onSelect={(event) => {
              updateSelection();
              onSelect?.(event);
            }}
            onFocus={(event) => {
              updateSelection();
              onFocus?.(event);
            }}
            onClick={(event) => {
              onClick?.(event);
              if (event.defaultPrevented || event.detail === 0) return;
              // Map a cell tap to its digit while keeping native keyboard selection available.
              const bounds = event.currentTarget.getBoundingClientRect();
              const index = Math.max(
                0,
                Math.min(
                  code.length,
                  Math.floor(
                    (event.clientX - bounds.left) / (bounds.width / 6),
                  ),
                ),
              );
              event.currentTarget.setSelectionRange(
                index,
                Math.min(index + 1, code.length),
              );
              updateSelection();
            }}
            onPaste={(event) => {
              onPaste?.(event);
              if (event.defaultPrevented || readOnly || disabled) return;
              event.preventDefault();
              const pasted = normalizeCode(event.clipboardData.getData("text"));
              if (!pasted) return;
              const start = event.currentTarget.selectionStart ?? code.length;
              const end = event.currentTarget.selectionEnd ?? start;
              const next =
                pasted.length === 6
                  ? pasted
                  : normalizeCode(
                      code.slice(0, start) + pasted + code.slice(end),
                    );
              updateCode(next);
              const caret =
                pasted.length === 6
                  ? 6
                  : Math.min(start + pasted.length, next.length);
              requestAnimationFrame(() => {
                input.current?.setSelectionRange(caret, caret);
                updateSelection();
              });
            }}
          />
          <div
            aria-hidden="true"
            dir="ltr"
            className="sui-otp-cells grid grid-cols-6 gap-2"
          >
            {Array.from({ length: 6 }, (_, index) => (
              <span
                key={index}
                data-active={index === Math.min(selection.start, 5)}
                data-selected={
                  index >= selection.start && index < selection.end
                }
                className="sui-otp-cell flex min-h-12 min-w-0 items-center justify-center rounded-sui-control border border-sui-border-control bg-sui-surface-default py-2 font-sui text-sui-code-otp text-sui-text-primary"
              >
                {code[index] || (
                  <span className="sui-otp-caret h-5 border-l-2 border-current" />
                )}
              </span>
            ))}
          </div>
        </div>
      )}
    </Field>
  );
}
