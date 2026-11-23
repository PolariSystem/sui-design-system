import { AssetIcon } from "./internal/AssetIcon";
import {
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { InputField, type InputProps } from "./Input";
import eye from "../assets/password-eye-bold.svg";

export interface PasswordInputProps extends Omit<InputProps, "type"> {
  showPasswordLabel?: string;
  hidePasswordLabel?: string;
  /** Optional decorative artwork for the visibility action; labels always describe its behavior. */
  visibilityIcon?: ReactNode;
}

/** Password value stays in the native input; visibility changes only its type. */
export function PasswordInput({
  ref,
  id,
  disabled,
  showPasswordLabel = "Show password",
  hidePasswordLabel = "Hide password",
  visibilityIcon,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const generatedId = useId();
  const inputId = id ?? generatedId;
  useImperativeHandle(ref, () => input.current!, []);
  useEffect(() => {
    const form = input.current?.form;
    // A cancelled reset must preserve both the value and its current visibility.
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (!event.defaultPrevented) setVisible(false);
      });
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [props.form]);
  return (
    <InputField
      {...props}
      ref={input}
      id={inputId}
      disabled={disabled}
      type={visible ? "text" : "password"}
      trailingAction={
        <button
          type="button"
          disabled={disabled}
          aria-label={visible ? hidePasswordLabel : showPasswordLabel}
          aria-controls={inputId}
          onClick={() => setVisible((current) => !current)}
          className="sui-password-toggle -mr-2 flex size-9 shrink-0 items-center justify-center rounded-sui-xs hover:bg-sui-navigation-hover focus-visible:outline-2 focus-visible:outline-sui-border-focus disabled:cursor-not-allowed disabled:opacity-(--sui-opacity-disabled)"
        >
          <span aria-hidden="true">
            {visibilityIcon ?? <AssetIcon src={eye} />}
          </span>
        </button>
      }
    />
  );
}
