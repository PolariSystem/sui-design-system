import { useRef, useState } from "react";
import {
  Button,
  Card,
  CardFooter,
  Dashboard,
  DashboardEditor,
  Dialog,
  DialogContent,
  DialogTrigger,
  KPIWidget,
  Select,
  Widget,
  moveDashboardItem,
  restoreDashboardLayout,
  serializeDashboardLayout,
  type DashboardItem,
  type DashboardWidgetDefinition,
} from "../src";
import { chartExamples } from "./chart-examples";
import { RecordsExample } from "./Tables";
import { Section } from "./components";
import catalogIcon from "../src/assets/dashboard-catalog.svg";
import saveIcon from "../src/assets/dashboard-save.svg";
import showIcon from "../src/assets/dashboard-show.svg";

const metrics = [
  {
    id: "active",
    title: "Active records",
    value: "1,248",
    comparison: "↑ 8.2% vs previous month",
  },
  {
    id: "milestones",
    title: "Milestones complete",
    value: "72%",
    comparison: "18 of 25 milestones",
  },
  {
    id: "september",
    title: "Created in September",
    value: "220",
    comparison: "46 more than August",
  },
];
const widgets: DashboardWidgetDefinition[] = [
  ...metrics.map((metric) => ({
    id: metric.id,
    title: metric.title,
    kind: "Metric",
    defaultZone: "summary" as const,
    defaultSize: "S" as const,
    sizes: ["S", "M", "L"] as const,
  })),
  ...chartExamples.map((example) => ({
    id: example.chart.type,
    title:
      example.chart.type === "metric" ? "Active records trend" : example.title,
    kind: example.name,
    defaultZone: "analysis" as const,
    defaultSize: "M" as const,
    sizes: ["M", "L"] as const,
  })),
];
const defaults: DashboardItem[] = widgets.map((widget) => ({
  id: widget.id,
  size: widget.defaultSize,
  zone:
    widget.defaultZone === "summary" || ["line", "goal"].includes(widget.id)
      ? widget.defaultZone
      : "hidden",
}));

// The reusable components do not access browser storage. This preview adapter scopes metadata
// to a workspace and demonstration profile; a production app supplies its authenticated identity.
function storageKey(profile: string) {
  return `sui:dashboard:v1:demo-workspace:${profile}`;
}
function loadLayout(profile: string): DashboardItem[] {
  try {
    return restoreDashboardLayout(
      localStorage.getItem(storageKey(profile)),
      widgets,
      defaults,
    );
  } catch {
    return defaults.map((item) => ({ ...item }));
  }
}

/** Reuse the same content in view and edit mode so users arrange the actual dashboard. */
function renderDashboardWidget(widget: DashboardWidgetDefinition) {
  const metric = metrics.find((metric) => metric.id === widget.id);
  if (metric)
    return (
      <KPIWidget
        title={metric.title}
        value={metric.value}
        comparison={metric.comparison}
      />
    );
  const example = chartExamples.find(
    (example) => example.chart.type === widget.id,
  )!;
  return (
    <Widget
      title={widget.title}
      description={example.subtitle}
      chart={example.chart}
      headingLevel={4}
    />
  );
}

function ProfileDashboard({
  profile,
  onEditingChange,
}: {
  profile: string;
  onEditingChange: (editing: boolean) => void;
}) {
  const [saved, setSaved] = useState(() => loadLayout(profile));
  const [draft, setDraft] = useState<DashboardItem[] | null>(null);
  const [notice, setNotice] = useState("");
  const editButton = useRef<HTMLButtonElement>(null);
  const editorHeading = useRef<HTMLHeadingElement>(null);
  const editing = draft !== null;
  function finish(message: string) {
    setDraft(null);
    onEditingChange(false);
    setNotice(message);
    requestAnimationFrame(() => editButton.current?.focus());
  }
  function save() {
    if (!draft) return;
    let persisted = true;
    try {
      localStorage.setItem(
        storageKey(profile),
        serializeDashboardLayout(draft),
      );
    } catch {
      persisted = false;
    }
    setSaved(draft);
    finish(
      persisted
        ? "Layout saved for this profile in this browser."
        : "Layout applied for this session. Browser storage is unavailable; changes will not survive a reload.",
    );
  }
  const saveActions = (
    <>
      <Button leftIcon={<img src={saveIcon} alt="" />} onClick={save}>
        Save layout
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          finish("Draft discarded. Your saved layout is unchanged.")
        }
      >
        Cancel
      </Button>
    </>
  );
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 ref={editorHeading} tabIndex={-1} className="text-sui-heading-lg">
            Your dashboard
          </h3>
          <p className="text-sui-body-sm text-sui-text-secondary">
            {editing
              ? "Edit mode is on · Drag your widgets into place, then save your layout."
              : "Your metrics and analysis, arranged for the way you work."}
          </p>
        </div>
        {editing ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                leftIcon={<img src={catalogIcon} alt="" />}
              >
                Widget catalog
              </Button>
            </DialogTrigger>
            <DialogContent
              title="Widget catalog"
              description="Restore a hidden widget to its recommended zone. Changes remain in your draft."
            >
              <div className="flex flex-col gap-4">
                {widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sui-label-md">{widget.title}</p>
                      <p className="text-sui-caption-md text-sui-text-secondary">
                        {widget.kind}
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      disabled={
                        draft.find((item) => item.id === widget.id)?.zone !==
                        "hidden"
                      }
                      leftIcon={<img src={showIcon} alt="" />}
                      onClick={() =>
                        setDraft(
                          moveDashboardItem(
                            draft,
                            widget.id,
                            widget.defaultZone,
                          ),
                        )
                      }
                    >
                      {draft.find((item) => item.id === widget.id)?.zone ===
                      "hidden"
                        ? "Show"
                        : "Added"}
                    </Button>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            ref={editButton}
            onClick={() => {
              setDraft(saved.map((item) => ({ ...item })));
              onEditingChange(true);
              setNotice("");
              requestAnimationFrame(() => editorHeading.current?.focus());
            }}
          >
            Customize dashboard
          </Button>
        )}
        {editing && (
          <CardFooter className="hidden sm:flex">{saveActions}</CardFooter>
        )}
      </header>
      <p role="status" className="text-sui-body-sm text-sui-text-secondary">
        {notice ||
          (editing
            ? "Unsaved draft"
            : "Personal layout · Changes are saved only when you choose Save layout.")}
      </p>
      {draft ? (
        <>
          <DashboardEditor
            widgets={widgets}
            value={draft}
            onChange={setDraft}
            renderWidget={renderDashboardWidget}
          />
          <p className="text-sui-caption-md text-sui-text-secondary">
            The existing table stays below your widgets. Its columns, cells and
            controls remain unchanged.
          </p>
          <CardFooter className="sui-dashboard-save-bar sm:hidden">
            {saveActions}
          </CardFooter>
        </>
      ) : (
        <Dashboard
          widgets={widgets}
          value={saved}
          renderWidget={renderDashboardWidget}
        />
      )}
      {/* Keep the existing records composition mounted so customization never resets its state. */}
      <section
        aria-label="Fixed records"
        className="flex min-w-0 flex-col gap-4"
      >
        <h3 className="text-sui-heading-xs">Recent records</h3>
        <RecordsExample />
      </section>
    </div>
  );
}

export function Dashboards() {
  const [profile, setProfile] = useState("leadership");
  const [editing, setEditing] = useState(false);
  return (
    <Section
      name="Dashboard"
      description="Arrange widgets by zone, choose their size and save a personal view. The records table stays fixed."
    >
      <Card padding="comfortable" className="mb-4">
        <Select
          label="Preview profile"
          value={profile}
          disabled={editing}
          onValueChange={setProfile}
        >
          <option value="leadership">Leadership</option>
          <option value="operations">Operations</option>
        </Select>
        <p className="text-sui-caption-md text-sui-text-secondary">
          Each demo profile keeps a separate layout in this browser. Save or
          cancel before switching profiles.
        </p>
      </Card>
      <div className="rounded-sui-lg border border-sui-border-default bg-sui-surface-default p-4 shadow-sui-elevation-subtle sm:p-4">
        <ProfileDashboard
          key={profile}
          profile={profile}
          onEditingChange={setEditing}
        />
      </div>
    </Section>
  );
}
