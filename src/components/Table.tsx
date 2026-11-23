import { useId, type ComponentPropsWithRef, type ReactNode } from "react";

export interface TableProps extends ComponentPropsWithRef<"table"> {
  /** Accessible table name; the scrollable region uses the same name. */
  label: string;
  /** Kept outside horizontal scrolling so empty-state copy remains visible on narrow screens. */
  emptyContent?: ReactNode;
}

/** Native table semantics are retained inside a keyboard-scrollable viewport. */
export function Table({
  label,
  children,
  className = "",
  emptyContent,
  ...props
}: TableProps) {
  const emptyId = useId();
  return (
    <div className="sui-table-surface">
      <div
        className="sui-table-viewport"
        role="region"
        aria-label={`${label} table viewport`}
        tabIndex={0}
      >
        <table
          {...props}
          aria-describedby={
            [props["aria-describedby"], emptyContent ? emptyId : undefined]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className={`sui-table font-sui ${className}`}
        >
          <caption className="sr-only">{label}</caption>
          {children}
        </table>
      </div>
      {emptyContent && (
        <div
          className="sui-table-empty"
          role="region"
          aria-label={`${label} empty state`}
        >
          <div id={emptyId}>{emptyContent}</div>
        </div>
      )}
    </div>
  );
}

export function TableHeader(props: ComponentPropsWithRef<"thead">) {
  return <thead {...props} />;
}
export function TableBody(props: ComponentPropsWithRef<"tbody">) {
  return <tbody {...props} />;
}
export interface TableRowProps extends ComponentPropsWithRef<"tr"> {
  selected?: boolean;
}
export function TableRow({ selected = false, ...props }: TableRowProps) {
  return <tr {...props} data-selected={selected} />;
}

interface IconSlots {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}
function CellContent({
  children,
  leftIcon,
  rightIcon,
}: IconSlots & { children?: ReactNode }) {
  return (
    <div className="sui-table-cell-content">
      {leftIcon && (
        <span aria-hidden className="sui-table-cell-icon">
          {leftIcon}
        </span>
      )}
      <div className="sui-table-cell-value">{children}</div>
      {rightIcon && (
        <span aria-hidden className="sui-table-cell-icon">
          {rightIcon}
        </span>
      )}
    </div>
  );
}
export type TableCellProps = ComponentPropsWithRef<"td"> & IconSlots;
export function TableCell({
  children,
  leftIcon,
  rightIcon,
  ...props
}: TableCellProps) {
  return (
    <td {...props}>
      <CellContent leftIcon={leftIcon} rightIcon={rightIcon}>
        {children}
      </CellContent>
    </td>
  );
}
export type TableHeadProps = ComponentPropsWithRef<"th"> & IconSlots;
export function TableHead({
  children,
  leftIcon,
  rightIcon,
  scope = "col",
  ...props
}: TableHeadProps) {
  return (
    <th {...props} scope={scope}>
      <CellContent leftIcon={leftIcon} rightIcon={rightIcon}>
        {children}
      </CellContent>
    </th>
  );
}
