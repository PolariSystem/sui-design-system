import { AssetIcon } from "./internal/AssetIcon";
import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ReactNode,
} from "react";
import { NavigationItem, type NavigationItemProps } from "./NavigationItem";
import searchIcon from "../assets/nav-search.svg";

export interface NavbarProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> {
  leading: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  items: Omit<NavigationItemProps, "layout">[];
  navigationLabel?: string;
  layout?: "auto" | "desktop" | "mobile";
}

/** Desktop toolbar and mobile navigation. The consuming shell owns fixed positioning and routes. */
export function Navbar({
  leading,
  search,
  actions,
  items,
  navigationLabel = "Primary navigation",
  layout = "auto",
  className = "",
  ...props
}: NavbarProps) {
  return (
    <div
      {...props}
      data-layout={layout}
      className={`sui-navbar min-w-0 font-sui ${className}`}
    >
      <div className="sui-navbar-desktop min-h-[76px] flex-wrap items-center justify-between gap-4 px-4 py-4">
        <div className="min-w-0">{leading}</div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-4">
          {search && <div className="min-w-0 max-w-full">{search}</div>}
          {actions && (
            <div className="flex items-center justify-end gap-2">{actions}</div>
          )}
        </div>
      </div>
      <nav
        aria-label={navigationLabel}
        className="sui-navbar-mobile items-stretch gap-2 border border-sui-border-default bg-sui-surface-default p-4"
      >
        {items.map((item) => (
          <NavigationItem
            key={item.id ?? `${item.href}:${item.label}`}
            {...item}
            layout="mobile"
          />
        ))}
      </nav>
    </div>
  );
}

export interface NavbarSearchProps extends Omit<
  ComponentPropsWithRef<"input">,
  "type" | "size"
> {
  label: string;
}

/** Search presentation only. Submit, shortcuts and result handling belong to the consuming form. */
export function NavbarSearch({
  label,
  className = "",
  ...props
}: NavbarSearchProps) {
  return (
    <label
      className={`sui-navbar-search flex min-h-10 w-[292px] min-w-0 max-w-full items-center gap-2 rounded-sui-control bg-sui-surface-canvas px-3 font-sui ${className}`}
    >
      <AssetIcon src={searchIcon} size={16} />
      <span className="sr-only">{label}</span>
      <input
        {...props}
        type="search"
        className="min-w-0 flex-1 bg-transparent py-2 text-sui-body-sm text-sui-text-body outline-none placeholder:text-sui-text-secondary"
      />
    </label>
  );
}
