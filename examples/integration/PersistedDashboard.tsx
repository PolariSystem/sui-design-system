import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardFooter,
  DashboardEditor,
  Skeleton,
  type DashboardItem,
  type DashboardWidgetDefinition,
} from "@serenity-ui/react";
import { errorMessage, requestJson } from "./api";
import { isLayout, type LayoutSnapshot } from "./contracts";
import { useRemoteResource } from "./useRemoteResource";

const widgets: DashboardWidgetDefinition[] = [
  {
    id: "activity",
    title: "Activity",
    kind: "Chart",
    defaultZone: "analysis",
    defaultSize: "M",
    sizes: ["M", "L"],
  },
  {
    id: "health",
    title: "Health",
    kind: "Metric",
    defaultZone: "summary",
    defaultSize: "M",
    sizes: ["M", "L"],
  },
];
function LayoutEditor({
  snapshot,
  reload,
  onSaved,
}: {
  snapshot: LayoutSnapshot;
  reload: () => void;
  onSaved: () => void;
}) {
  const [items, setItems] = useState<DashboardItem[]>(snapshot.items);
  const [version, setVersion] = useState(snapshot.version);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  async function save() {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setFeedback("");
    try {
      const next = await requestJson("/api/dashboard", isLayout, {
        method: "PUT",
        signal: controller.signal,
        body: JSON.stringify({ version, items }),
      });
      if (!controller.signal.aborted) {
        setVersion(next.version);
        onSaved();
      }
    } catch (error) {
      if (!controller.signal.aborted) setFeedback(errorMessage(error));
    } finally {
      if (!controller.signal.aborted) setPending(false);
      if (request.current === controller) request.current = null;
    }
  }
  return (
    <>
      <DashboardEditor
        widgets={widgets}
        value={items}
        onChange={(next) => {
          if (!pending) setItems(next);
        }}
      />
      {feedback && (
        <Alert title={feedback} tone="danger" announcement="assertive" />
      )}
      <CardFooter>
        <Button loading={pending} onClick={() => void save()}>
          Save dashboard
        </Button>
        <Button variant="secondary" disabled={pending} onClick={reload}>
          Reload saved layout
        </Button>
      </CardFooter>
    </>
  );
}
export function PersistedDashboard({ onSaved }: { onSaved: () => void }) {
  const [revision, setRevision] = useState(0);
  const remote = useRemoteResource("/api/dashboard", isLayout, revision);
  const reload = () => setRevision((value) => value + 1);
  return (
    <Card padding="comfortable">
      <h2 className="text-sui-heading-xs">Saved dashboard</h2>
      {remote.loading && (
        <div role="status">
          <span className="sr-only">Loading dashboard…</span>
          <Skeleton />
        </div>
      )}
      {remote.error && (
        <>
          <Alert title={remote.error} tone="danger" announcement="assertive" />
          <CardFooter>
            <Button variant="secondary" onClick={reload}>
              Retry dashboard
            </Button>
          </CardFooter>
        </>
      )}
      {remote.data && (
        <LayoutEditor
          key={revision}
          snapshot={remote.data}
          reload={reload}
          onSaved={onSaved}
        />
      )}
    </Card>
  );
}
