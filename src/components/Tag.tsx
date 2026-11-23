import type { ComponentPropsWithoutRef, ReactNode } from "react";

export interface TagProps extends ComponentPropsWithoutRef<"span"> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  disabled?: boolean;
  /** An explicit removal action; the tag label itself never removes a value. */
  onRemove?: () => void;
  removeLabel?: string;
}

/** Selected-value label with optional, separately named removal. Icon slots are decorative. */
export function Tag({
  children,
  leftIcon,
  rightIcon,
  disabled,
  onRemove,
  removeLabel = "Remove tag",
  className = "",
  ...props
}: TagProps) {
  return (
    <span
      {...props}
      aria-disabled={disabled || undefined}
      data-disabled={Boolean(disabled)}
      data-interactive={Boolean(onRemove)}
      className={`sui-tag inline-flex min-h-7 max-w-full items-center justify-center gap-2 rounded-sui-full border border-sui-border-control bg-sui-surface-default px-2 py-1 font-sui text-sui-label-sm text-sui-text-secondary ${className}`}
    >
      {leftIcon && (
        <span aria-hidden="true" className="inline-flex size-4 shrink-0">
          {leftIcon}
        </span>
      )}
      <span className="min-w-0 break-words">{children}</span>
      {rightIcon && (
        <span aria-hidden="true" className="inline-flex size-4 shrink-0">
          {rightIcon}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          disabled={disabled}
          aria-label={removeLabel}
          onClick={onRemove}
          className="sui-tag-remove rounded-sui-xs px-1 text-sui-text-link underline focus-visible:outline-2 focus-visible:outline-sui-border-focus disabled:text-sui-text-disabled"
        >
          Remove
        </button>
      )}
    </span>
  );
}
