import type { ComponentPropsWithRef, ReactNode } from "react";

export interface NavigationItemProps extends Omit<
  ComponentPropsWithRef<"a">,
  "children"
> {
  label: string;
  /** Supply the approved Bold Duotone icon; activeIcon supplies its Bold counterpart. */
  icon: ReactNode;
  activeIcon: ReactNode;
  active?: boolean;
  layout?: "expanded" | "compact" | "mobile";
}

/** Persistent route selection uses aria-current, independently of press and keyboard focus. */
export function NavigationItem({
  label,
  icon,
  activeIcon,
  active = false,
  layout = "expanded",
  className = "",
  ...props
}: NavigationItemProps) {
  return (
    <a
      {...props}
      aria-current={active ? "page" : undefined}
      aria-label={layout === "compact" ? label : props["aria-label"]}
      title={layout === "compact" ? label : props.title}
      data-layout={layout}
      className={`sui-nav-item flex min-h-10 min-w-10 items-center gap-2 rounded-sui-control p-2 font-sui text-sui-body-sm text-sui-text-body focus-visible:outline-2 focus-visible:outline-sui-border-focus ${className}`}
    >
      <span
        aria-hidden="true"
        className="inline-flex size-5 shrink-0 items-center justify-center"
      >
        {active ? activeIcon : icon}
      </span>
      {layout !== "compact" && (
        <span className="min-w-0 break-words">{label}</span>
      )}
    </a>
  );
}
