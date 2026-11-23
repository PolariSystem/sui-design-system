import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Avatar } from "./Avatar";
import { NavigationItem, type NavigationItemProps } from "./NavigationItem";
import down from "../assets/nav-down.svg";

export interface SidebarProps extends Omit<
  ComponentPropsWithoutRef<"nav">,
  "children"
> {
  brand: ReactNode;
  compactBrand?: ReactNode;
  toggle?: ReactNode;
  workspace: ReactNode;
  account: ReactNode;
  items: Omit<NavigationItemProps, "layout">[];
  footerItems?: Omit<NavigationItemProps, "layout">[];
  groupLabel?: string;
  compact?: boolean;
}

/** A rail, not an overlay. On small screens compose a Drawer around it in the application shell. */
export function Sidebar({
  brand,
  compactBrand,
  toggle,
  workspace,
  account,
  items,
  footerItems = [],
  groupLabel = "Workspace",
  compact = false,
  className = "",
  "aria-label": label = "Workspace navigation",
  ...props
}: SidebarProps) {
  const layout = compact ? "compact" : "expanded";
  return (
    <nav
      {...props}
      aria-label={label}
      data-compact={compact}
      className={`sui-sidebar flex min-h-0 shrink-0 flex-col justify-between gap-4 rounded-sui-card font-sui ${compact ? "w-10" : "w-52"} ${className}`}
    >
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex min-h-10 items-center justify-between gap-2">
          {compact ? (compactBrand ?? brand) : brand}
          {!compact && toggle}
        </div>
        {workspace}
        <hr className="border-sui-border-default" />
        <div className="flex flex-col gap-2">
          {!compact && (
            <p className="text-sui-label-xs text-sui-text-secondary uppercase">
              {groupLabel}
            </p>
          )}
          {items.map((item) => (
            <NavigationItem
              key={item.id ?? `${item.href}:${item.label}`}
              {...item}
              layout={layout}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {footerItems.map((item) => (
          <NavigationItem
            key={item.id ?? `${item.href}:${item.label}`}
            {...item}
            layout={layout}
          />
        ))}
        <hr className="border-sui-border-default" />
        {account}
      </div>
    </nav>
  );
}

export interface SidebarIdentityProps extends Omit<
  ComponentPropsWithoutRef<"button">,
  "children"
> {
  name: string;
  description?: string;
  initials: string;
  compact?: boolean;
  expandable?: boolean;
}

/** A named workspace/account action. Open a real chooser or account view in onClick. */
export function SidebarIdentity({
  name,
  description,
  initials,
  compact,
  expandable,
  className = "",
  type = "button",
  ...props
}: SidebarIdentityProps) {
  return (
    <button
      {...props}
      type={type}
      aria-label={compact ? name : props["aria-label"]}
      title={compact ? name : props.title}
      className={`sui-sidebar-identity flex min-w-0 items-center gap-2 rounded-sui-card border border-sui-border-default bg-sui-surface-default text-start shadow-sui-elevation-surface focus-visible:outline-2 focus-visible:outline-sui-border-focus ${compact ? "size-10 justify-center p-1" : "w-full p-3"} ${className}`}
    >
      <Avatar name={name} initials={initials} size={32} aria-hidden="true" />
      {!compact && (
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-sui-label-sm text-sui-text-body">{name}</span>
          {description && (
            <span className="text-sui-caption-sm text-sui-text-secondary">
              {description}
            </span>
          )}
        </span>
      )}
      {!compact && expandable && <img src={down} alt="" className="shrink-0" />}
    </button>
  );
}
