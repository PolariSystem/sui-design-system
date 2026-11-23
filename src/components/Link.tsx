import type { ComponentPropsWithRef } from "react";

export interface LinkProps extends ComponentPropsWithRef<"a"> {
  /** Removes the destination and activation while preserving the unavailable link label. */
  disabled?: boolean;
}

/** A real navigation link; routers can intercept its native click without losing anchor semantics. */
export function Link({
  disabled = false,
  href,
  onClick,
  className = "",
  tabIndex,
  ...props
}: LinkProps) {
  return (
    <a
      {...props}
      href={disabled ? undefined : href}
      role={disabled ? "link" : props.role}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : tabIndex}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      className={`sui-link inline-flex max-w-full items-center gap-2 rounded-sui-xs p-1 font-sui text-sui-label-md text-sui-text-link hover:text-sui-text-link-hover focus-visible:outline-2 focus-visible:outline-sui-border-focus aria-disabled:cursor-not-allowed aria-disabled:text-sui-text-disabled aria-disabled:opacity-(--sui-opacity-disabled) ${className}`}
    />
  );
}
