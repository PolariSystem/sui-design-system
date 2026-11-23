import type { ComponentPropsWithoutRef } from "react";

export interface AvatarProps extends Omit<
  ComponentPropsWithoutRef<"span">,
  "children"
> {
  name: string;
  initials?: string;
  size?: 24 | 30 | 32 | 40 | 48;
}
const sizes = {
  30: "min-h-[30px] min-w-[30px] text-sui-avatar-table",
  24: "min-h-6 min-w-6 text-sui-label-md",
  32: "min-h-8 min-w-8 text-sui-label-md",
  40: "min-h-10 min-w-10 text-sui-label-lg",
  48: "min-h-12 min-w-12 text-sui-label-lg",
};

/** Initials identify a person or workspace. Set aria-hidden when adjacent text already names it. */
export function Avatar({
  name,
  initials,
  size = 32,
  className = "",
  ...props
}: AvatarProps) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const fallback = [words[0], words.length > 1 ? words.at(-1) : undefined]
    .filter(Boolean)
    .map((word) => Array.from(word!)[0])
    .join("")
    .toLocaleUpperCase();
  return (
    <span
      role="img"
      aria-label={name}
      {...props}
      className={`sui-avatar inline-flex shrink-0 items-center justify-center rounded-sui-full bg-sui-action-secondary-pressed font-sui text-sui-text-link ${sizes[size]} ${className}`}
    >
      <span aria-hidden="true">{initials ?? fallback}</span>
    </span>
  );
}
