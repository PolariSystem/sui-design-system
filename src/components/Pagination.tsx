import { AssetIcon } from "./internal/AssetIcon";
import type { ComponentPropsWithoutRef } from "react";
import { Button } from "./Button";
import previousIcon from "../assets/pagination-previous.svg";
import nextIcon from "../assets/pagination-next.svg";

export interface PaginationProps extends Omit<
  ComponentPropsWithoutRef<"nav">,
  "children" | "onChange"
> {
  page: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  getPageLabel?: (page: number) => string;
  formatRange?: (start: number, end: number, total: number) => string;
}

/** Controlled pagination. The parent loads/slices data; this component never changes the table. */
export function Pagination({
  page,
  totalItems,
  pageSize,
  onPageChange,
  disabled,
  previousLabel = "Previous",
  nextLabel = "Next",
  getPageLabel = (value) => `Page ${value}`,
  formatRange = (start, end, total) =>
    `Showing ${start.toLocaleString()}–${end.toLocaleString()} of ${total.toLocaleString()} records`,
  className = "",
  "aria-label": label = "Pagination",
  ...props
}: PaginationProps) {
  const total = Number.isFinite(totalItems)
    ? Math.max(0, Math.floor(totalItems))
    : 0;
  const size = Number.isFinite(pageSize)
    ? Math.max(1, Math.floor(pageSize))
    : 1;
  const count = Math.max(1, Math.ceil(total / size));
  const current = Number.isFinite(page)
    ? Math.min(count, Math.max(1, Math.floor(page)))
    : 1;
  const first = Math.max(1, Math.min(current - 1, count - 2));
  const pages = Array.from({ length: Math.min(3, count) }, (_, i) => first + i);
  const choose = (next: number) => {
    if (!disabled && next !== current && next >= 1 && next <= count)
      onPageChange(next);
  };
  return (
    <nav
      {...props}
      aria-label={label}
      className={`sui-pagination flex min-w-0 flex-wrap items-center justify-between gap-3 font-sui ${className}`}
    >
      <p className="text-sui-caption-md text-sui-text-secondary">
        {formatRange(
          total ? (current - 1) * size + 1 : 0,
          Math.min(current * size, total),
          total,
        )}
      </p>
      <div className="sui-pagination-actions flex max-w-full items-center justify-end gap-2">
        <Button
          variant="secondary"
          disabled={disabled || current === 1 || !total}
          onClick={() => choose(current - 1)}
          leftIcon={<AssetIcon src={previousIcon} size={16} />}
          aria-label={previousLabel}
        >
          <span className="sui-page-direction">{previousLabel}</span>
        </Button>
        {first > 1 && (
          <span
            aria-hidden="true"
            className="sui-page-extra text-sui-text-secondary"
          >
            …
          </span>
        )}
        {pages.map((number) => (
          <Button
            key={number}
            variant={number === current ? "primary" : "secondary"}
            disabled={disabled || !total}
            aria-current={number === current ? "page" : undefined}
            aria-label={getPageLabel(number)}
            className={number === current ? "" : "sui-page-extra"}
            onClick={() => choose(number)}
          >
            {number}
          </Button>
        ))}
        {pages.at(-1)! < count && (
          <span
            aria-hidden="true"
            className="sui-page-extra text-sui-text-secondary"
          >
            …
          </span>
        )}
        <Button
          variant="secondary"
          disabled={disabled || current === count || !total}
          onClick={() => choose(current + 1)}
          rightIcon={<AssetIcon src={nextIcon} size={16} />}
          aria-label={nextLabel}
        >
          <span className="sui-page-direction">{nextLabel}</span>
        </Button>
      </div>
    </nav>
  );
}
