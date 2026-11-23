import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import {
  DataTable,
  type DataTableColumn,
  type DataTableSort,
  Checkbox,
  IconButton,
} from "../src";

const rows = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
  { id: "locked", name: "Locked" },
];
const columns: DataTableColumn<(typeof rows)[number]>[] = [
  { id: "name", header: "Name", cell: (row) => row.name, sortable: true },
];
const props = {
  label: "Records",
  columns,
  rows,
  getRowId: (row: (typeof rows)[number]) => row.id,
  getRowLabel: (row: (typeof rows)[number]) => row.name,
};

it("keeps row actions separate, names their heading accessibly and spans recovery rows", () => {
  const rowActions = (row: (typeof rows)[number]) => (
    <IconButton aria-label={`Actions for ${row.name}`} icon={<svg />} />
  );
  const { rerender } = render(
    <DataTable
      {...props}
      rowActions={rowActions}
      actionsLabel="Record actions"
    />,
  );
  const head = screen.getByRole("columnheader", { name: "Record actions" });
  expect(head.firstChild).toContainElement(screen.getByText("Record actions"));
  expect(screen.getByText("Record actions")).toHaveClass("sr-only");
  const row = screen.getByText("Alpha").closest("tr")!;
  const cells = within(row).getAllByRole("cell");
  expect(cells).toHaveLength(2);
  expect(within(cells[0]).queryByRole("button")).not.toBeInTheDocument();
  expect(
    within(cells[1]).getByRole("button", { name: "Actions for Alpha" }),
  ).toBeInTheDocument();
  rerender(<DataTable {...props} rowActions={rowActions} loading />);
  expect(screen.getAllByRole("cell")[0]).toHaveAttribute("colspan", "2");
  expect(
    screen.queryByRole("button", { name: "Actions for Alpha" }),
  ).not.toBeInTheDocument();
  rerender(
    <DataTable
      {...props}
      rowActions={rowActions}
      error="Unavailable"
      selection={{ selectedIds: [], onSelectedIdsChange: vi.fn() }}
    />,
  );
  expect(screen.getByRole("cell")).toHaveAttribute("colspan", "3");
});

it("preserves off-page IDs while selecting and clearing eligible page rows", async () => {
  const change = vi.fn();
  function Example() {
    const [ids, setIds] = useState(["outside", "a"]);
    return (
      <DataTable
        {...props}
        selection={{
          selectedIds: ids,
          onSelectedIdsChange: (next) => {
            setIds(next);
            change(next);
          },
          isRowSelectable: (row) => row.id !== "locked",
        }}
      />
    );
  }
  render(<Example />);
  const all = screen.getByRole("checkbox", {
    name: "Select all rows on this page",
  });
  expect(all).toBePartiallyChecked();
  expect(
    screen.getByRole("checkbox", { name: "Select Locked" }),
  ).toBeDisabled();
  await userEvent.click(all);
  expect(change).toHaveBeenLastCalledWith(["outside", "a", "b"]);
  expect(all).toBeChecked();
  await userEvent.click(all);
  expect(change).toHaveBeenLastCalledWith(["outside"]);
  expect(all).not.toBeChecked();
});

it("requests sorting without silently reordering owner-provided rows", async () => {
  const change = vi.fn();
  function Example() {
    const [sort, setSort] = useState<DataTableSort | null>(null);
    return (
      <DataTable
        {...props}
        sort={sort}
        onSortChange={(next) => {
          change(next);
          setSort(next);
        }}
      />
    );
  }
  render(<Example />);
  const sort = screen.getByRole("button", { name: "Sort by Name" });
  sort.focus();
  await userEvent.keyboard("{Enter}");
  expect(screen.getByRole("columnheader")).toHaveAttribute(
    "aria-sort",
    "ascending",
  );
  await userEvent.keyboard(" ");
  expect(change).toHaveBeenLastCalledWith({
    columnId: "name",
    direction: "descending",
  });
  expect(screen.getByRole("columnheader")).toHaveAttribute(
    "aria-sort",
    "descending",
  );
  expect(
    within(screen.getByRole("table"))
      .getAllByRole("cell")
      .map((cell) => cell.textContent),
  ).toEqual(["Alpha", "Beta", "Locked"]);
});

it("blocks stale selection, sort and pagination during loading or error", async () => {
  const change = vi.fn();
  const { rerender } = render(
    <DataTable
      {...props}
      loading
      onSortChange={change}
      selection={{ selectedIds: ["a"], onSelectedIdsChange: change }}
      pagination={{ page: 1, pageSize: 3, totalItems: 9, onPageChange: change }}
    />,
  );
  expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
  expect(screen.getByRole("status")).toHaveTextContent("Loading records");
  expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Sort by Name" }));
  await userEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(change).not.toHaveBeenCalled();
  rerender(
    <DataTable
      {...props}
      error="Records unavailable"
      selection={{ selectedIds: ["a"], onSelectedIdsChange: change }}
    />,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Records unavailable");
  expect(screen.getByRole("checkbox")).toBeDisabled();
});

it("shows an empty state and names the native table and scrollable region", () => {
  render(<DataTable {...props} rows={[]} />);
  expect(screen.getByRole("table", { name: "Records" })).toBeInTheDocument();
  expect(
    screen.getByRole("region", { name: "Records table viewport" }),
  ).toHaveAttribute("tabindex", "0");
  expect(screen.getByText("No records")).toBeInTheDocument();
});

it("rejects ambiguous row or column identities", () => {
  expect(() =>
    render(<DataTable {...props} rows={[rows[0], rows[0]]} />),
  ).toThrow(RangeError);
  expect(() =>
    render(<DataTable {...props} columns={[columns[0], columns[0]]} />),
  ).toThrow(RangeError);
});

it("prioritizes loading and errors over empty content, then restores real rows", () => {
  const { rerender } = render(
    <DataTable {...props} rows={[]} emptyState={<p>No matching records</p>} />,
  );
  const table = screen.getByRole("table", { name: "Records" });
  expect(table).toHaveAccessibleDescription("No matching records");
  expect(
    screen.getByRole("region", { name: "Records table viewport" }),
  ).not.toContainElement(screen.getByText("No matching records"));
  rerender(<DataTable {...props} rows={[]} loading />);
  expect(screen.queryByText("No records")).not.toBeInTheDocument();
  expect(table).not.toHaveAttribute("aria-describedby");
  rerender(<DataTable {...props} rows={[]} error="Records unavailable" />);
  expect(screen.getByRole("alert")).toHaveTextContent("Records unavailable");
  expect(screen.queryByText("No records")).not.toBeInTheDocument();
  rerender(<DataTable {...props} />);
  expect(screen.getByText("Alpha")).toBeInTheDocument();
  expect(
    screen.queryByRole("region", { name: "Records empty state" }),
  ).not.toBeInTheDocument();
});

it("keeps compact selection native and honors disabled submission", async () => {
  render(
    <form data-testid="selection">
      <Checkbox size={16} label="Compact" name="record" value="a" />
      <Checkbox
        size={16}
        label="Disabled"
        name="record"
        value="b"
        defaultChecked
        disabled
      />
    </form>,
  );
  const checkbox = screen.getByRole("checkbox", { name: "Compact" });
  checkbox.focus();
  await userEvent.keyboard(" ");
  expect(checkbox).toBeChecked();
  expect(
    new FormData(screen.getByTestId("selection") as HTMLFormElement).getAll(
      "record",
    ),
  ).toEqual(["a"]);
});
