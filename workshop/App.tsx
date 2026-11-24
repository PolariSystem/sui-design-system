import { ScrollAreas } from "./ScrollAreas";
import { WorkshopShell } from "./WorkshopShell";
import { useTheme } from "./theme";
import { ThemeReference } from "./ThemeReference";
import { MotionPage } from "./MotionPage";
import { lazy, Suspense, useState, type FormEvent } from "react";
import { Badge, Button, Card, CardFooter, Checkbox, Input } from "../src";

import { Example, Section, Specimen } from "./components";
import { FormControls } from "./FormControls";
import { Navigation } from "./Navigation";
import { Feedback } from "./Feedback";
import { Overlays } from "./Overlays";
import { Pickers } from "./Pickers";
import { Tables } from "./Tables";
import { IconButtons } from "./IconButtons";
import { Charts } from "./Charts";
import { Dashboards } from "./Dashboards";
import { Authentication } from "./Authentication";
import { FileUploads } from "./FileUploads";

const DocumentationPage = lazy(() => import("./DocumentationPage"));

function ProfileExample() {
  const [name, setName] = useState("Serenity workspace");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(false);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid work email.");
      document.getElementById("profile-email")?.focus();
      return;
    }
    setError("");
    setPending(true);
    // Preview-only latency: demonstrates the pending state without sending or persisting data.
    await new Promise((resolve) => setTimeout(resolve, 800));
    setPending(false);
    setSaved(true);
  }
  return (
    <form noValidate onSubmit={submit} className="flex max-w-lg flex-col gap-4">
      <Input
        label="Workspace name"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          setSaved(false);
        }}
        autoComplete="organization"
      />
      <Input
        id="profile-email"
        label="Work email"
        type="email"
        required
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          setError("");
          setSaved(false);
        }}
        error={error}
        helperText="Used for workspace notifications."
        autoComplete="email"
      />
      <CardFooter>
        <Button type="submit" loading={pending} loadingLabel="Saving…">
          Save changes
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setName("Serenity workspace");
            setEmail("");
            setError("");
            setSaved(false);
          }}
        >
          Reset
        </Button>
      </CardFooter>
      <p role="status" className="text-sui-body-sm text-sui-text-secondary">
        {saved
          ? "Changes saved for this preview. No data was sent."
          : "Interactive preview · data stays in this page."}
      </p>
    </form>
  );
}

function ComponentExamples() {
  const { resolved } = useTheme();
  const [buttonSize, setButtonSize] = useState<"sm" | "md" | "lg">("md");
  const [buttonVariant, setButtonVariant] = useState<
    "primary" | "secondary" | "tertiary" | "danger"
  >("primary");
  const [clicks, setClicks] = useState(0);
  const [selection, setSelection] = useState([true, false]);
  const [archived, setArchived] = useState(false);
  const selectedCount = selection.filter(Boolean).length;
  return (
    <>
      <Section
        name="Foundations"
        description="The same visual language, from Figma to the browser."
      >
        <ThemeReference />
        <MobileTypography />
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [
              "Canvas",
              "bg-sui-surface-canvas",
              resolved === "dark" ? "#0B1620" : "#F3F6F8",
            ],
            [
              "Action",
              "bg-sui-action-primary-default",
              resolved === "dark" ? "#0077A8" : "#006F9F",
            ],
            [
              "Primary text",
              "bg-sui-text-primary",
              resolved === "dark" ? "#EFF6FA" : "#00263E",
            ],
          ].map(([name, color, hex]) => (
            <Card key={name}>
              <div
                aria-hidden="true"
                className={`h-16 rounded-sui-control border border-sui-border-default ${color}`}
              />
              <h3 className="mt-2 text-sui-label-md">{name}</h3>
              <p className="text-sui-caption-md text-sui-text-secondary">
                {hex}
              </p>
            </Card>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-8 rounded-sui-lg border border-sui-border-default bg-sui-surface-default p-4 shadow-sui-elevation-subtle">
          <div>
            <p className="text-sui-heading-sm">DM Sans</p>
            <p className="text-sui-body-sm text-sui-text-secondary">
              Type with room to breathe
            </p>
          </div>
          <div>
            <p className="text-sui-heading-sm">4 · 8 · 12 · 16 · 24 · 32</p>
            <p className="text-sui-body-sm text-sui-text-secondary">
              Spacing in multiples of four
            </p>
          </div>
        </div>
      </Section>
      <Section
        name="Button"
        description="Four emphases. Three sizes. Native keyboard and pointer states."
      >
        <Specimen>
          <div className="flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">Tertiary</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm">Small</Button>
            <Button>Medium</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </div>
          <p className="text-sui-caption-md text-sui-text-secondary">
            Use Tab to inspect focus. Hover and press to inspect interaction
            states.
          </p>
        </Specimen>
        <Example>
          <div className="mb-4 flex flex-wrap gap-4">
            <fieldset>
              <legend className="mb-2 text-sui-label-md">Size</legend>
              <div className="flex gap-2">
                {(["sm", "md", "lg"] as const).map((size) => (
                  <Button
                    key={size}
                    size="sm"
                    variant="secondary"
                    aria-pressed={buttonSize === size}
                    onClick={() => setButtonSize(size)}
                    className="aria-pressed:bg-sui-navigation-active"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-sui-label-md">Variant</legend>
              <div className="flex flex-wrap gap-2">
                {(["primary", "secondary", "tertiary", "danger"] as const).map(
                  (variant) => (
                    <Button
                      key={variant}
                      size="sm"
                      variant="secondary"
                      aria-pressed={buttonVariant === variant}
                      onClick={() => setButtonVariant(variant)}
                      className="aria-pressed:bg-sui-navigation-active"
                    >
                      {variant}
                    </Button>
                  ),
                )}
              </div>
            </fieldset>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button
              size={buttonSize}
              variant={buttonVariant}
              onClick={() => setClicks((value) => value + 1)}
            >
              Try this button
            </Button>
            <p
              role="status"
              className="text-sui-caption-md text-sui-text-secondary"
            >
              Clicked {clicks} times
            </p>
          </div>
        </Example>
      </Section>
      <Section
        name="Input"
        description="Visible labels, useful guidance and accessible validation."
      >
        <Specimen>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Default"
              placeholder="Enter a value"
              helperText="Supporting guidance."
            />
            <Input
              label="Compact"
              size="compact"
              defaultValue="Workspace onboarding"
            />
            <Input
              label="Error"
              defaultValue="name@"
              error="Enter a valid email address."
            />
            <Input label="Read only" readOnly value="Serenity workspace" />
            <Input label="Disabled" disabled placeholder="Unavailable" />
            <Input
              label="Password"
              type="password"
              defaultValue="Example-only"
              autoComplete="off"
            />
          </div>
        </Specimen>
        <Example>
          <ProfileExample />
        </Example>
      </Section>
      <FormControls />
      <Section
        name="Checkbox"
        description="Unchecked, checked and mixed — using Solar Unread Bold."
      >
        <Specimen>
          <div className="flex flex-wrap gap-4">
            <Checkbox label="Unchecked" />
            <Checkbox label="Checked" defaultChecked />
            <Checkbox label="Mixed" indeterminate />
            <Checkbox label="Disabled" disabled />
            <Checkbox label="Checked disabled" defaultChecked disabled />
          </div>
        </Specimen>
        <Example>
          <div className="flex flex-col items-start gap-4">
            <Checkbox
              label="Select all records"
              checked={selectedCount === 2}
              indeterminate={selectedCount === 1}
              onChange={(event) =>
                setSelection([event.target.checked, event.target.checked])
              }
            />
            <div className="ml-7 flex flex-col gap-4">
              {["Quarterly report", "Customer research"].map((name, index) => (
                <Checkbox
                  key={name}
                  label={name}
                  checked={selection[index]}
                  onChange={(event) =>
                    setSelection((current) =>
                      current.map((value, position) =>
                        position === index ? event.target.checked : value,
                      ),
                    )
                  }
                />
              ))}
            </div>
            <p
              role="status"
              className="text-sui-caption-md text-sui-text-secondary"
            >
              {selectedCount} of 2 records selected
            </p>
          </div>
        </Example>
      </Section>
      <Section
        name="Badge"
        description="Status is communicated through text as well as color."
      >
        <Specimen>
          <div className="flex flex-wrap gap-2">
            <Badge>Draft</Badge>
            <Badge tone="info">In review</Badge>
            <Badge tone="success">Approved</Badge>
            <Badge tone="warning">Pending</Badge>
            <Badge tone="danger">Failed</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge size="md">Draft</Badge>
            <Badge tone="info" size="md">
              In review
            </Badge>
            <Badge tone="success" size="md">
              Approved
            </Badge>
            <Badge tone="warning" size="md">
              Pending
            </Badge>
            <Badge tone="danger" size="md">
              Failed
            </Badge>
          </div>
        </Specimen>
        <Example>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-sui-body-md">Workspace onboarding</span>
            <Badge tone="success">Approved</Badge>
          </div>
        </Example>
      </Section>
      <Section
        name="Card"
        description="Flexible content and right-aligned footer actions."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h3 className="text-sui-label-md text-sui-text-secondary">
              Active records
            </h3>
            <p className="text-sui-metric-lg">1,248</p>
            <p className="text-sui-caption-md text-sui-text-secondary">
              ↑ 8.2% vs previous month
            </p>
          </Card>
          <Card padding="compact">
            <h3 className="text-sui-heading-xs">Compact card</h3>
            <p className="text-sui-body-sm text-sui-text-secondary">
              16 px padding. Content decides the height.
            </p>
          </Card>
        </div>
        <Example>
          <Card
            padding="comfortable"
            elevation="floating"
            className="max-w-[436px] gap-4"
          >
            <h3 className="text-sui-heading-xs">
              {archived ? "Record archived" : "Archive this record?"}
            </h3>
            <p className="text-sui-body-sm text-sui-text-secondary">
              {archived
                ? "This preview can be restored at any time."
                : "You can restore this record from the archive at any time."}
            </p>
            <CardFooter>
              {archived ? (
                <Button variant="secondary" onClick={() => setArchived(false)}>
                  Restore record
                </Button>
              ) : (
                <>
                  <Button onClick={() => setArchived(true)}>
                    Archive record
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setArchived(false)}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </CardFooter>
            <span role="status" className="sr-only">
              {archived ? "Record archived." : ""}
            </span>
          </Card>
        </Example>
      </Section>

      <ScrollAreas />
      <Navigation />
      <Feedback />
      <Overlays />
      <Pickers />
      <IconButtons />
      <Tables />
      <Charts />
      <Dashboards />
      <Authentication />
      <FileUploads />
    </>
  );
}

export function App({ fragment }: { fragment: string }) {
  return (
    <WorkshopShell fragment={fragment}>
      <ComponentExamples />
      <MotionPage />
      {fragment.replace(/^#/, "").split("/")[0] === "documentation" && (
        <Suspense fallback={<p role="status">Loading documentation…</p>}>
          <DocumentationPage fragment={fragment} />
        </Suspense>
      )}
    </WorkshopShell>
  );
}

function MobileTypography() {
  return (
    <Card className="mb-4">
      <h2 className="text-sui-heading-sm">Responsive typography</h2>
      <p className="text-sui-body-md text-sui-text-secondary">
        Below 640 px, headings use a compact scale. Body text and controls
        retain their sizes. The same aliases work in Light and Dark.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["Display lg", "48 / 56 → 32 / 40"],
          ["Display sm", "40 / 48 → 28 / 36"],
          ["Heading xl", "32 / 40 → 24 / 32"],
          ["Heading lg", "28 / 36 → 20 / 28"],
          ["Heading md", "24 / 32 → 20 / 28"],
          ["Heading sm", "20 / 28 → 18 / 24"],
          ["Heading xs", "16 / 24 → 16 / 24"],
        ].map(([role, values]) => (
          <div key={role}>
            <p className="text-sui-label-md">{role}</p>
            <p className="text-sui-body-sm text-sui-text-secondary">
              {values} px · size / line height
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
