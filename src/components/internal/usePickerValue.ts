import { useEffect, useRef, useState } from "react";

/** Form reset is cancelable. Controlled values remain owned by the parent, as with native React fields. */
export function usePickerValue<T>(
  value: T | undefined,
  defaultValue: T,
  onValueChange?: (value: T) => void,
) {
  const [internal, setInternal] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const resetRef = useRef<(() => void) | undefined>(undefined);
  const current = value === undefined ? internal : value;
  useEffect(() => {
    const form = inputRef.current?.form;
    const reset = (event: Event) =>
      queueMicrotask(() => {
        if (event.defaultPrevented) return;
        if (value === undefined) setInternal(defaultValue);
        resetRef.current?.();
      });
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [value, defaultValue]);
  return {
    current,
    inputRef,
    resetRef,
    commit: (next: T) => {
      if (value === undefined) setInternal(next);
      onValueChange?.(next);
    },
  };
}
