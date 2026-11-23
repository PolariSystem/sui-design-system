import { AssetIcon } from "./internal/AssetIcon";
import { Fragment, type ComponentPropsWithoutRef, type ReactNode } from "react";
import back from "../assets/breadcrumb-back.svg";
import separator from "../assets/breadcrumb-separator.svg";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
export interface BreadcrumbProps extends Omit<
  ComponentPropsWithoutRef<"nav">,
  "children"
> {
  items: BreadcrumbItem[];
  /** Compact trails show the nearest parent and current location. */
  compact?: boolean;
  leadingAction?: ReactNode;
}

/** The current location is text, not a redundant link. Keep destinations owned by the application. */
export function Breadcrumb({
  items,
  compact = false,
  leadingAction,
  className = "",
  "aria-label": label = "Breadcrumb",
  ...props
}: BreadcrumbProps) {
  const visible = compact ? items.slice(-2) : items;
  return (
    <nav
      {...props}
      aria-label={label}
      className={`sui-breadcrumb flex min-w-0 items-center gap-2 font-sui ${className}`}
    >
      {leadingAction}
      <ol className="flex min-w-0 flex-wrap items-center gap-2">
        {visible.map((item, index) => (
          <Fragment key={`${item.href ?? "current"}-${index}`}>
            {index > 0 && (
              <li aria-hidden="true" className="flex shrink-0 items-center">
                <AssetIcon src={separator} size={12} />
              </li>
            )}
            <li className="min-w-0 break-words">
              {index === visible.length - 1 ? (
                <span
                  aria-current="page"
                  className="text-sui-label-sm text-sui-text-body"
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="sui-breadcrumb-link inline-flex items-center gap-2 rounded-sui-xs text-sui-caption-md text-sui-text-secondary hover:text-sui-text-link focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sui-border-focus"
                >
                  {index === 0 && !leadingAction && (
                    <AssetIcon src={back} size={16} />
                  )}
                  {item.label}
                </a>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
