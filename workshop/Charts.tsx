import { useState } from "react";
import {
  Button,
  Chart,
  Widget,
  KPIWidget,
  Select,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  type ChartProps,
} from "../src";
import more from "../src/assets/widget-more.svg";
import { chartExamples, type ChartExample } from "./chart-examples";
import { Example, Section, Specimen } from "./components";

function ReplayChart({ example }: { example: ChartExample }) {
  const [cycle, setCycle] = useState(0);
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sui-heading-xs">{example.name}</h3>
        <Button
          size="sm"
          variant="secondary"
          aria-label={`Replay values for ${example.name}`}
          onClick={() => setCycle((value) => value + 1)}
        >
          Play
        </Button>
      </div>
      <div className="min-h-64">
        <Chart {...example.chart} animationKey={cycle} />
      </div>
    </div>
  );
}

function WidgetActions({
  title,
  visible,
  onToggle,
}: {
  title: string;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="tertiary" iconOnly aria-label={`Actions for ${title}`}>
          <img src={more} alt="" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={onToggle}>
          {visible ? "Hide data table" : "View data table"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
function SpecimenWidget({ example }: { example: ChartExample }) {
  const [showData, setShowData] = useState(false);
  const [cycle, setCycle] = useState(0);
  return (
    <Widget
      title={example.title}
      description={example.subtitle}
      chart={{ ...example.chart, showDataTable: showData, animationKey: cycle }}
      className={example.wide ? "sui-widget-wide" : ""}
      actions={
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setCycle((value) => value + 1)}
            aria-label={`Replay values for ${example.title}`}
          >
            Play
          </Button>
          {example.menu && (
            <WidgetActions
              title={example.title}
              visible={showData}
              onToggle={() => setShowData(!showData)}
            />
          )}
        </div>
      }
      footer={
        !example.menu ? (
          <>
            <p className="text-sui-label-strong text-sui-text-link">
              {example.placement}
            </p>
            <p className="text-sui-caption-md text-sui-text-secondary">
              {example.guidance}
            </p>
          </>
        ) : example.chart.type === "stacked-bar" ? (
          <p className="text-sui-chart-axis text-sui-text-secondary">
            {example.guidance}
          </p>
        ) : undefined
      }
    />
  );
}
function ChartExampleControls() {
  const [type, setType] = useState("line");
  const [showData, setShowData] = useState(false);
  const [period, setPeriod] = useState("current");
  const values =
    period === "current"
      ? [120, 150, 132, 188, 174, 220]
      : [110, 130, 122, 162, 148, 194];
  const chart: ChartProps = {
    type: type as "line" | "area" | "column",
    label: "Records by month",
    max: 240,
    showDataTable: showData,
    data: ["Apr", "May", "Jun", "Jul", "Aug", "Sep"].map((label, i) => ({
      id: label,
      label,
      value: values[i],
    })),
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Chart type" value={type} onValueChange={setType}>
          <option value="line">Line</option>
          <option value="area">Area</option>
          <option value="column">Column</option>
        </Select>
        <Select
          label="Reporting period"
          value={period}
          onValueChange={setPeriod}
        >
          <option value="current">Current period</option>
          <option value="previous">Previous period</option>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="secondary"
          aria-pressed={showData}
          onClick={() => setShowData(!showData)}
        >
          {showData ? "Hide chart data" : "Show chart data"}
        </Button>
      </div>
      <Chart {...chart} />
    </div>
  );
}
function WidgetExample() {
  const [state, setState] = useState<"ready" | "loading" | "error" | "empty">(
    "ready",
  );
  const [showData, setShowData] = useState(false);
  const example = chartExamples[1];
  const chart = example.chart;
  if (chart.type !== "line") return null;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap justify-end gap-2">
        {(["ready", "loading", "error", "empty"] as const).map((value) => (
          <Button
            key={value}
            variant="secondary"
            aria-pressed={state === value}
            onClick={() => setState(value)}
          >{`Preview ${value}`}</Button>
        ))}
      </div>
      <Widget
        title="Workspace activity"
        description="Records · Apr–Sep 2026"
        loading={state === "loading"}
        error={state === "error" ? "Activity could not be loaded." : undefined}
        recovery={
          <Button variant="secondary" onClick={() => setState("ready")}>
            Retry activity
          </Button>
        }
        chart={{
          ...chart,
          label: "Workspace activity",
          data: state === "empty" ? [] : chart.data,
          showDataTable: showData,
        }}
        actions={
          <WidgetActions
            title="Workspace activity"
            visible={showData}
            onToggle={() => setShowData(!showData)}
          />
        }
      />
    </div>
  );
}
export function Charts() {
  return (
    <>
      <Section
        name="Chart"
        description="Twelve data-driven visualizations with proportional marks, readable labels and an accessible data table."
      >
        <Specimen>
          <div className="sui-chart-gallery">
            {chartExamples.map((example) => (
              <ReplayChart key={example.name} example={example} />
            ))}
          </div>
        </Specimen>
        <Example>
          <ChartExampleControls />
        </Example>
      </Section>
      <Section
        name="Widget"
        description="Thirteen approved card compositions, with contextual actions and explicit loading, error and empty states."
      >
        <Specimen>
          <div className="sui-widget-gallery">
            <KPIWidget
              title="Active records"
              value="1,248"
              comparison="↑ 8.2% vs previous month"
            />
            {chartExamples.map((example) => (
              <SpecimenWidget key={example.name} example={example} />
            ))}
          </div>
        </Specimen>
        <Example>
          <WidgetExample />
        </Example>
      </Section>
    </>
  );
}
