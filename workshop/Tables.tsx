import { useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  CardFooter,
  DataTable,
  Dialog,
  DialogContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  Input,
  IconButton,
  EmptyState,
  type DataTableColumn,
  type DataTableSort,
  type BadgeProps,
} from "../src";
import more from "../src/assets/table-more.svg";
import { Section, Example, Specimen } from "./components";

type RecordStatus = "In progress" | "Completed" | "Needs review" | "Draft";
interface RecordItem {
  id: string;
  name: string;
  category: string;
  owner: string;
  status: RecordStatus;
  updated: string;
  priority: string;
}
const initialRecords: RecordItem[] = [
  {
    id: "REC–128",
    name: "Workspace onboarding",
    category: "Operations",
    owner: "Alex Morgan",
    status: "In progress",
    updated: "2026-10-09T10:24",
    priority: "High",
  },
  {
    id: "REC–127",
    name: "Quarterly review",
    category: "Planning",
    owner: "Jamie Chen",
    status: "Completed",
    updated: "2026-10-09T09:18",
    priority: "Normal",
  },
  {
    id: "REC–126",
    name: "Access policy update",
    category: "Administration",
    owner: "Taylor Reed",
    status: "Needs review",
    updated: "2026-10-08",
    priority: "High",
  },
  {
    id: "REC–125",
    name: "Customer feedback",
    category: "Research",
    owner: "Jordan Lee",
    status: "In progress",
    updated: "2026-10-08",
    priority: "Normal",
  },
  {
    id: "REC–124",
    name: "Resource allocation",
    category: "Operations",
    owner: "Sam Rivera",
    status: "Draft",
    updated: "2026-10-07",
    priority: "Low",
  },
  {
    id: "REC–123",
    name: "October report",
    category: "Reporting",
    owner: "Alex Morgan",
    status: "Completed",
    updated: "2026-10-06",
    priority: "Normal",
  },
  {
    id: "REC–122",
    name: "Team guidelines",
    category: "Administration",
    owner: "Jamie Chen",
    status: "Draft",
    updated: "2026-10-06",
    priority: "Low",
  },
];
const tones: Record<RecordStatus, BadgeProps["tone"]> = {
  "In progress": "info",
  Completed: "success",
  "Needs review": "warning",
  Draft: "neutral",
};
const rowId = (row: RecordItem) => row.id;
const rowLabel = (row: RecordItem) => row.name;
function recordColumns(sortable = false): DataTableColumn<RecordItem>[] {
  return [
    {
      id: "name",
      header: "Record name",
      minWidth: 180,
      sortable,
      cell: (row) => (
        <div className="sui-table-record">
          <span className="text-sui-table-primary text-sui-text-body">
            {row.name}
          </span>
          <span className="text-sui-caption-sm">
            {row.id} / {row.category}
          </span>
        </div>
      ),
    },
    {
      id: "owner",
      header: "Owner",
      width: 204,
      minWidth: 204,
      sortable,
      cell: (row) => (
        <div className="sui-table-owner">
          <Avatar name={row.owner} size={30} aria-hidden />
          <span className="text-sui-table-secondary">{row.owner}</span>
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      width: 164,
      minWidth: 164,
      sortable,
      cell: (row) => (
        <Badge
          tone={tones[row.status]}
          data-tone={tones[row.status]}
          className="sui-table-badge"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      id: "updated",
      header: "Last updated",
      width: 160,
      minWidth: 160,
      sortable,
      cell: (row) => (
        <time dateTime={row.updated}>
          {row.updated.includes("T")
            ? `Today, ${row.updated.slice(11)}`
            : `Oct ${row.updated.slice(8)}, 2026`}
        </time>
      ),
    },
    {
      id: "priority",
      header: "Priority",
      width: 184,
      minWidth: 184,
      sortable,
      cell: (row) => row.priority,
    },
  ];
}
export function RecordsExample({ specimen = false }: { specimen?: boolean }) {
  const [records, setRecords] = useState(initialRecords);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    specimen ? ["REC–128", "REC–127"] : [],
  );
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const [state, setState] = useState<"ready" | "loading" | "error" | "empty">(
    "ready",
  );
  const [detail, setDetail] = useState<RecordItem | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const menuTrigger = useRef<HTMLButtonElement | null>(null);
  const updateStatus = (ids: readonly string[]) => {
    setRecords((previous) =>
      previous.map((row) =>
        ids.includes(row.id) ? { ...row, status: "Completed" } : row,
      ),
    );
    setAnnouncement(
      `${ids.length} record${ids.length === 1 ? "" : "s"} marked completed.`,
    );
  };
  const columns = recordColumns(!specimen);
  const rowActions = (row: RecordItem) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant="tertiary"
          icon={<img src={more} alt="" />}
          aria-label={`Actions for ${row.name}`}
          onPointerDown={(event) => {
            menuTrigger.current = event.currentTarget;
          }}
          onKeyDown={(event) => {
            menuTrigger.current = event.currentTarget;
          }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent aria-label={`Actions for ${row.name}`}>
        <DropdownMenuItem onSelect={() => setDetail(row)}>
          View record
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={row.status === "Completed"}
          onSelect={() => updateStatus([row.id])}
        >
          Mark completed
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
  const filtered = (state === "empty" ? [] : records).filter((row) =>
    `${row.name} ${row.owner} ${row.category}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  // Sorting before slicing keeps page boundaries consistent. IDs keep selection independent of order.
  if (sort)
    filtered.sort((a, b) => {
      const field = sort.columnId as keyof RecordItem;
      const result =
        field === "priority"
          ? ["Low", "Normal", "High"].indexOf(a.priority) -
            ["Low", "Normal", "High"].indexOf(b.priority)
          : a[field].localeCompare(b[field]);
      return sort.direction === "ascending" ? result : -result;
    });
  const pageSize = 4;
  const rows = specimen
    ? filtered
    : filtered.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="flex min-w-0 flex-col gap-4">
      {!specimen && (
        <>
          <Input
            label="Search records"
            value={query}
            onChange={(e) => {
              setQuery(e.currentTarget.value);
              setPage(1);
            }}
            placeholder="Search by name, owner or category"
          />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="secondary"
              aria-pressed={state === "empty"}
              onClick={() => {
                setState(state === "empty" ? "ready" : "empty");
                setPage(1);
              }}
            >
              {state === "empty" ? "Show records" : "Preview empty"}
            </Button>
            <Button
              variant="secondary"
              aria-pressed={state === "loading"}
              onClick={() =>
                setState(state === "loading" ? "ready" : "loading")
              }
            >
              {state === "loading" ? "Show records" : "Preview loading"}
            </Button>
            <Button
              variant="secondary"
              aria-pressed={state === "error"}
              onClick={() => setState(state === "error" ? "ready" : "error")}
            >
              Preview error
            </Button>
            <Button
              disabled={!selectedIds.length || state !== "ready"}
              onClick={() => updateStatus(selectedIds)}
            >
              Mark selected completed
            </Button>
            <Button
              variant="secondary"
              disabled={!selectedIds.length}
              onClick={() => setSelectedIds([])}
            >
              Clear selection
            </Button>
          </div>
          <p className="text-sui-caption-md text-sui-text-secondary">
            {selectedIds.length} selected across all pages. Preview changes stay
            in this browser session.
          </p>
        </>
      )}
      <DataTable
        label={specimen ? "Records specimen" : "Workspace records"}
        rows={rows}
        columns={columns}
        rowActions={rowActions}
        getRowId={rowId}
        getRowLabel={rowLabel}
        selection={{ selectedIds, onSelectedIdsChange: setSelectedIds }}
        sort={sort}
        onSortChange={
          specimen
            ? undefined
            : (next) => {
                setSort(next);
                setPage(1);
              }
        }
        loading={state === "loading"}
        error={
          state === "error" ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p>Records could not be loaded.</p>
              <Button variant="secondary" onClick={() => setState("ready")}>
                Retry
              </Button>
            </div>
          ) : undefined
        }
        emptyState={
          state !== "empty" && query.trim() ? (
            <EmptyState
              variant="subtle"
              illustration="search"
              title="No matching records"
              description="Try another name, owner or category."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setPage(1);
                  }}
                >
                  Clear search
                </Button>
              }
            />
          ) : undefined
        }
        pagination={
          specimen
            ? undefined
            : {
                page,
                pageSize,
                totalItems: filtered.length,
                onPageChange: setPage,
              }
        }
      />
      <p role="status" className="sr-only">
        {announcement}
      </p>
      <Dialog
        open={Boolean(detail)}
        onOpenChange={(open) => {
          if (!open) setDetail(null);
        }}
      >
        <DialogContent
          title={detail?.name ?? "Record details"}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            menuTrigger.current?.focus();
          }}
        >
          {detail && (
            <>
              <p className="text-sui-body-md">
                {detail.id} · {detail.category}
              </p>
              <p className="text-sui-body-sm">Owner: {detail.owner}</p>
              <p className="text-sui-body-sm">Status: {detail.status}</p>
            </>
          )}
          <CardFooter>
            <Button variant="secondary" onClick={() => setDetail(null)}>
              Close details
            </Button>
          </CardFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
export function Tables() {
  return (
    <Section
      name="DataTable"
      description="The approved Records table, with native table semantics, selection, sorting and paged data."
    >
      <Specimen>
        <h3 className="text-sui-heading-xs">Records specimen</h3>
        <RecordsExample specimen />
      </Specimen>
      <Example>
        <RecordsExample />
      </Example>
    </Section>
  );
}
