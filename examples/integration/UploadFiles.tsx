import { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  CardFooter,
  FileUpload,
  FileUploadItem,
  type FileUploadStatus,
} from "@serenity-ui/react";
import { uploadFile } from "./upload";

interface Entry {
  id: string;
  file: File;
  status: FileUploadStatus;
  progress?: number;
  error?: string;
}
/** Transport and queue ownership belong to the application; the kit only renders and selects. */
export function UploadFiles() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const picker = useRef<HTMLButtonElement>(null);
  const requests = useRef(new Map<string, AbortController>());
  useEffect(
    () => () => {
      requests.current.forEach((controller) => controller.abort());
      requests.current.clear();
    },
    [],
  );
  const update = (id: string, patch: Partial<Entry>) =>
    setEntries((current) =>
      current.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    );
  async function start(entry: Entry) {
    if (requests.current.has(entry.id)) return;
    const controller = new AbortController();
    requests.current.set(entry.id, controller);
    update(entry.id, {
      status: "uploading",
      progress: undefined,
      error: undefined,
    });
    try {
      await uploadFile(entry.file, controller.signal, (progress) => {
        if (requests.current.get(entry.id) === controller)
          update(entry.id, { progress });
      });
      if (!controller.signal.aborted)
        update(entry.id, { status: "success", progress: 100 });
    } catch (error) {
      if (!controller.signal.aborted)
        update(entry.id, {
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed.",
        });
    } finally {
      if (requests.current.get(entry.id) === controller)
        requests.current.delete(entry.id);
    }
  }
  return (
    <Card>
      <h2 className="text-sui-heading-xs">Upload attachments</h2>
      <p className="text-sui-body-sm text-sui-text-secondary">
        CSV files are validated and counted by the local service. File contents
        are not retained.
      </p>
      <FileUpload
        label="Choose CSV attachments"
        triggerProps={{ ref: picker }}
        accept=".csv"
        multiple
        maxSize={1_048_576}
        maxFiles={Math.max(1, 5 - entries.length)}
        disabled={entries.length >= 5}
        helperText="CSV · Up to 1 MiB each · Up to 5 files"
        onFilesSelect={(files) =>
          setEntries((current) => [
            ...current,
            ...files.slice(0, 5 - current.length).map((file) => ({
              id: crypto.randomUUID(),
              file,
              status: "queued" as const,
            })),
          ])
        }
      />
      <ul aria-label="Attachments" className="integration-stack">
        {entries.map((entry) => (
          <li key={entry.id}>
            <FileUploadItem
              name={entry.file.name}
              detail={`${entry.file.size.toLocaleString("en-US")} bytes`}
              status={entry.status}
              progress={entry.progress}
              error={entry.error}
              onCancel={() => {
                requests.current.get(entry.id)?.abort();
                requests.current.delete(entry.id);
                update(entry.id, { status: "cancelled" });
              }}
              onRetry={() => void start(entry)}
              onRemove={() => {
                setEntries((current) =>
                  current.filter((item) => item.id !== entry.id),
                );
                // The picker can be disabled until the removed row frees a slot.
                requestAnimationFrame(() => picker.current?.focus());
              }}
            />
          </li>
        ))}
      </ul>
      <CardFooter>
        <Button
          disabled={!entries.some((entry) => entry.status === "queued")}
          onClick={() =>
            entries
              .filter((entry) => entry.status === "queued")
              .forEach((entry) => void start(entry))
          }
        >
          Upload selected files
        </Button>
      </CardFooter>
    </Card>
  );
}
