import type { CSSProperties, ReactNode } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./Table";
import { Checkbox } from "./Checkbox";
import { Pagination, type PaginationProps } from "./Pagination";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";

export interface DataTableSort {
  columnId: string;
  direction: "ascending" | "descending";
}
export interface DataTableColumn<T> {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Enables a sort request; the owner supplies the resulting row order. */
  sortable?: boolean;
  width?: CSSProperties["width"];
  minWidth?: CSSProperties["minWidth"];
  leftIcon?: (row: T) => ReactNode;
  rightIcon?: (row: T) => ReactNode;
}
export interface DataTableProps<T> {
  label: string;
  columns: readonly DataTableColumn<T>[];
  /** Visible page only. Filtering, sorting and pagination belong to the data owner. */
  rows: readonly T[];
  getRowId: (row: T) => string;
  getRowLabel: (row: T) => string;
  /** Renders an independent trailing cell. Use tertiary IconButton controls with row-specific names. */
  rowActions?: (row: T) => ReactNode;
  /** Screen-reader-only column heading; no visible title is rendered. */
  actionsLabel?: string;
  selection?: {
    selectedIds: readonly string[];
    onSelectedIdsChange: (ids: string[]) => void;
    isRowSelectable?: (row: T) => boolean;
    selectPageLabel?: string;
    getSelectionLabel?: (row: T) => string;
  };
  sort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort) => void;
  getSortLabel?: (column: DataTableColumn<T>) => string;
  pagination?: Pick<
    PaginationProps,
    | "page"
    | "totalItems"
    | "pageSize"
    | "onPageChange"
    | "previousLabel"
    | "nextLabel"
    | "formatRange"
    | "getPageLabel"
  >;
  loading?: boolean;
  loadingLabel?: string;
  error?: ReactNode;
  emptyState?: ReactNode;
  className?: string;
}

/** Controlled data presentation. Stable IDs preserve selection across pages and sorting. */
export function DataTable<T>({
  label,
  columns,
  rows,
  getRowId,
  getRowLabel,
  rowActions,
  actionsLabel = "Actions",
  selection,
  sort,
  onSortChange,
  getSortLabel = (column) => `Sort by ${column.header}`,
  pagination,
  loading = false,
  loadingLabel = "Loading records",
  error,
  emptyState,
  className = "",
}: DataTableProps<T>) {
  const ids = rows.map(getRowId);
  if (
    !columns.length ||
    new Set(columns.map((c) => c.id)).size !== columns.length ||
    ids.some((id) => !id) ||
    new Set(ids).size !== ids.length
  )
    throw new RangeError(
      "DataTable requires columns with unique IDs and nonempty unique row IDs.",
    );
  const selected = new Set(selection?.selectedIds);
  const eligible = rows
    .filter((row) => selection?.isRowSelectable?.(row) !== false)
    .map(getRowId);
  const count = eligible.filter((id) => selected.has(id)).length;
  const blocked = loading || Boolean(error);
  const toggle = (targets: readonly string[], checked: boolean) => {
    if (!selection || blocked) return;
    const next = new Set(selected);
    targets.forEach((id) => (checked ? next.add(id) : next.delete(id)));
    selection.onSelectedIdsChange([...next]);
  };
  const span = columns.length + (selection ? 1 : 0) + (rowActions ? 1 : 0);
  return (
    <div className={`sui-data-table flex min-w-0 flex-col gap-4 ${className}`}>
      <p role="status" className="sr-only">
        {loading ? loadingLabel : ""}
      </p>
      <Table
        label={label}
        aria-busy={loading}
        emptyContent={
          !blocked && !rows.length
            ? (emptyState ?? (
                <EmptyState
                  variant="subtle"
                  illustration="files"
                  title="No records"
                  description="Records will appear here when available."
                />
              ))
            : undefined
        }
      >
        <colgroup>
          {selection && <col style={{ width: 56 }} />}
          {columns.map((column) => (
            <col key={column.id} style={{ width: column.width }} />
          ))}
          {rowActions && <col className="sui-table-actions-column" />}
        </colgroup>
        <TableHeader>
          <TableRow>
            {selection && (
              <TableHead className="sui-table-selection">
                <Checkbox
                  size={16}
                  label={
                    <span className="sr-only">
                      {selection.selectPageLabel ??
                        "Select all rows on this page"}
                    </span>
                  }
                  checked={eligible.length > 0 && count === eligible.length}
                  indeterminate={count > 0 && count < eligible.length}
                  disabled={blocked || !eligible.length}
                  onChange={(e) => toggle(eligible, e.currentTarget.checked)}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.id}
                style={{ minWidth: column.minWidth }}
                aria-sort={
                  column.sortable && onSortChange
                    ? sort?.columnId === column.id
                      ? sort.direction
                      : "none"
                    : undefined
                }
              >
                {column.sortable && onSortChange ? (
                  <button
                    type="button"
                    className="sui-table-sort"
                    disabled={blocked}
                    aria-label={getSortLabel(column)}
                    onClick={() =>
                      onSortChange({
                        columnId: column.id,
                        direction:
                          sort?.columnId === column.id &&
                          sort.direction === "ascending"
                            ? "descending"
                            : "ascending",
                      })
                    }
                  >
                    {column.header}
                    <span aria-hidden>
                      {sort?.columnId === column.id
                        ? sort.direction === "ascending"
                          ? "↑"
                          : "↓"
                        : "↕"}
                    </span>
                  </button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
            {rowActions && (
              <TableHead className="sui-table-actions">
                <span className="sr-only">{actionsLabel}</span>
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            [0, 1, 2].map((n) => (
              <TableRow key={n}>
                <TableCell colSpan={span}>
                  <Skeleton />
                </TableCell>
              </TableRow>
            ))
          ) : error ? (
            <TableRow>
              <TableCell colSpan={span}>
                <div role="alert">{error}</div>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row, i) => (
              <TableRow key={ids[i]} selected={selected.has(ids[i])}>
                {selection && (
                  <TableCell className="sui-table-selection">
                    <Checkbox
                      size={16}
                      label={
                        <span className="sr-only">
                          {selection.getSelectionLabel?.(row) ??
                            `Select ${getRowLabel(row)}`}
                        </span>
                      }
                      checked={selected.has(ids[i])}
                      disabled={selection.isRowSelectable?.(row) === false}
                      onChange={(e) =>
                        toggle([ids[i]], e.currentTarget.checked)
                      }
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    style={{ minWidth: column.minWidth }}
                    leftIcon={column.leftIcon?.(row)}
                    rightIcon={column.rightIcon?.(row)}
                  >
                    {column.cell(row)}
                  </TableCell>
                ))}
                {rowActions && (
                  <TableCell className="sui-table-actions">
                    <div className="sui-table-action-group">
                      {rowActions(row)}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pagination && (
        <Pagination
          {...pagination}
          aria-label={`${label} pagination`}
          disabled={blocked}
        />
      )}
    </div>
  );
}
