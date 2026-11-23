import { useState } from "react";
import {
  Button,
  Card,
  DataTable,
  Input,
  type DataTableColumn,
  type DataTableSort,
} from "@serenity-ui/react";
import { isRecordsPage, type RecordItem } from "./contracts";
import { useRemoteResource } from "./useRemoteResource";

const columns: DataTableColumn<RecordItem>[] = [
  {
    id: "name",
    header: "Workspace",
    sortable: true,
    cell: (record) => record.name,
  },
  { id: "role", header: "Access", cell: (record) => record.role },
];
export function RemoteRecords({ revision }: { revision: number }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataTableSort>({
    columnId: "name",
    direction: "ascending",
  });
  const [retry, setRetry] = useState(0);
  const params = new URLSearchParams({
    query,
    page: String(page),
    pageSize: "4",
    direction: sort.direction,
  });
  const remote = useRemoteResource(
    `/api/records?${params}`,
    isRecordsPage,
    revision + retry,
  );
  return (
    <Card padding="comfortable">
      <h2 className="integration-heading">Remote records</h2>
      <Input
        label="Search workspaces"
        value={query}
        maxLength={100}
        onChange={(event) => {
          setQuery(event.target.value);
          setPage(1);
        }}
      />
      <DataTable
        label="Workspaces"
        columns={columns}
        rows={remote.data?.items ?? []}
        getRowId={(record) => record.id}
        getRowLabel={(record) => record.name}
        loading={remote.loading}
        error={
          remote.error && (
            <span>
              {remote.error}{" "}
              <Button
                variant="tertiary"
                onClick={() => setRetry((value) => value + 1)}
              >
                Retry records
              </Button>
            </span>
          )
        }
        sort={sort}
        onSortChange={(next) => {
          setSort(next);
          setPage(1);
        }}
        pagination={{
          page,
          pageSize: 4,
          totalItems: remote.data?.total ?? 0,
          onPageChange: setPage,
        }}
      />
    </Card>
  );
}
