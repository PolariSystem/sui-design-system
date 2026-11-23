import {
  useEffect,
  useRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { CheckboxArtwork } from "./internal/CheckboxArtwork";

export interface CheckboxProps extends Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "size" | "children"
> {
  label: ReactNode;
  /** Visual mixed state, independent of checked. Native form submission still uses checked. */
  indeterminate?: boolean;
  /** The approved Records table uses a 16 px control; other fields default to 20 px. */
  size?: 16 | 20;
}

/**
 * Native form control with Solar Unread artwork layered above it.
 * The input retains focus, keyboard behavior and form semantics; artwork is decorative.
 */
export function Checkbox({
  label,
  indeterminate = false,
  size = 20,
  disabled,
  className = "",
  ...props
}: CheckboxProps) {
  const input = useRef<HTMLInputElement>(null);
  // indeterminate is a DOM property, not an HTML attribute. User activation clears it;
  // controlled selection groups must derive it alongside checked on subsequent updates.
  useEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <label
      className={`sui-checkbox inline-flex items-start gap-2 font-sui text-sui-label-md ${disabled ? "cursor-not-allowed text-sui-text-disabled" : "cursor-pointer text-sui-text-primary"} ${className}`}
    >
      <span
        className={`relative inline-flex shrink-0 ${size === 16 ? "size-4" : "size-5"}`}
      >
        <input
          {...props}
          ref={input}
          type="checkbox"
          disabled={disabled}
          className="peer absolute inset-0 z-10 m-0 size-full cursor-[inherit] opacity-0"
        />
        <CheckboxArtwork disabled={disabled} size={size} />
      </span>
      <span>{label}</span>
    </label>
  );
}
