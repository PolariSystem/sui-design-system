import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardFooter,
  EmptyState,
  Input,
  Progress,
  Skeleton,
  Toast,
  ToastProvider,
  ToastViewport,
} from "../src";
import { Example, Section, Specimen } from "./components";
import add from "../src/assets/action-add.svg";
import { EmptyStateGallery } from "./EmptyStateGallery";

function AlertExample() {
  const [name, setName] = useState("");
  const [result, setResult] = useState<"idle" | "error" | "success">("idle");
  return (
    <form
      className="flex max-w-lg flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setResult(name.trim() ? "success" : "error");
      }}
    >
      <Input
        label="Feedback workspace name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        aria-invalid={result === "error"}
      />
      <div aria-live="polite" aria-atomic="true">
        {result !== "idle" && (
          <Alert
            title={
              result === "error"
                ? "A workspace name is required"
                : "Workspace details are ready"
            }
            tone={result === "error" ? "danger" : "success"}
          >
            {result === "error"
              ? "Add a name and try again. Your entered values are preserved."
              : "Validation passed in this preview. No information was sent."}
          </Alert>
        )}
      </div>
      <CardFooter>
        <Button type="submit">Validate workspace</Button>
      </CardFooter>
    </form>
  );
}

function ToastSpecimen({ action = false }: { action?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <ToastProvider>
      <div className="flex min-w-0 flex-col gap-4">
        <Toast
          open={open}
          onOpenChange={setOpen}
          duration={Infinity}
          title="Changes saved"
          description="Your workspace is up to date."
          action={
            action
              ? {
                  label: "Undo",
                  altText: "Undo the sample change",
                  onClick: () => {},
                }
              : undefined
          }
        />
        <ToastViewport
          inline
          hotkey={[]}
          label={action ? "Action toast specimen" : "Compact toast specimen"}
        />
        {!open && (
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Show toast specimen
          </Button>
        )}
      </div>
    </ToastProvider>
  );
}

function ToastExample() {
  const [archived, setArchived] = useState(false);
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState(false);
  return (
    <ToastProvider>
      <div className="flex flex-col gap-4">
        <p role="status" className="text-sui-body-sm">
          {archived
            ? "The sample record is archived."
            : "The sample record is active."}
        </p>
        <CardFooter>
          <Button
            disabled={archived}
            onClick={() => {
              setArchived(true);
              setOpen(true);
            }}
          >
            Archive sample
          </Button>
          <Button variant="secondary" onClick={() => setFeedback(true)}>
            Show compact feedback
          </Button>
        </CardFooter>
        <Toast
          open={open}
          onOpenChange={setOpen}
          title="Record archived"
          description="You can undo this action without leaving the page."
          action={{
            label: "Undo archive",
            altText: "Undo archive using the notification action (F8)",
            onClick: () => setArchived(false),
          }}
        />
        <Toast
          open={feedback}
          onOpenChange={setFeedback}
          title="Preview synced"
          description="The preview is up to date."
          duration={5000}
        />
        <ToastViewport label="Preview notifications ({hotkey})" />
      </div>
    </ToastProvider>
  );
}

function ProgressExample() {
  const [value, setValue] = useState(0);
  const [error, setError] = useState(false);
  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Progress
        label={
          error
            ? "Import interrupted"
            : value === 100
              ? "Import complete"
              : "Importing records"
        }
        value={value}
        error={error}
      />
      <CardFooter>
        <Button
          disabled={value === 100 || error}
          onClick={() => setValue(Math.min(100, value + 25))}
        >
          Advance progress
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setValue(0);
            setError(false);
          }}
        >
          Reset progress
        </Button>
        <Button
          variant="secondary"
          disabled={value === 0 || value === 100}
          onClick={() => setError(!error)}
        >
          {error ? "Resume import" : "Interrupt import"}
        </Button>
      </CardFooter>
      <p role="status" className="text-sui-body-sm">
        {error
          ? "Import paused. No data was sent."
          : `${value}% complete in this preview.`}
      </p>
    </div>
  );
}

function LoadingExample() {
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Button
        variant="secondary"
        disabled={loading}
        onClick={() => {
          setLoading(true);
          timer.current = setTimeout(() => setLoading(false), 1200);
        }}
      >
        Reload sample records
      </Button>
      <div role="region" aria-label="Sample records" aria-busy={loading}>
        {loading ? (
          <Skeleton shape="card" />
        ) : (
          <Card padding="comfortable">
            <p className="text-sui-heading-xs">Your records</p>
            {["Alex Morgan", "Jordan Rivera", "Sam Taylor"].map((name) => (
              <div key={name} className="flex items-center gap-3 py-2">
                <Avatar name={name} aria-hidden />
                <p className="text-sui-body-sm">{name}</p>
              </div>
            ))}
          </Card>
        )}
      </div>
      <p role="status" className="sr-only">
        {loading ? "Loading sample records." : "Three sample records loaded."}
      </p>
    </div>
  );
}

function EmptyExample() {
  const [created, setCreated] = useState(false);
  return (
    <div className="max-w-lg">
      {created ? (
        <Card padding="comfortable">
          <p role="status" className="text-sui-body-md">
            Your first preview record is ready.
          </p>
          <CardFooter>
            <Button variant="secondary" onClick={() => setCreated(false)}>
              Reset empty state
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <EmptyState
          title="A fresh start."
          description="No records yet. Create your first one to give your team a place to begin."
          action={
            <Button
              className="w-full"
              leftIcon={<img src={add} alt="" />}
              onClick={() => setCreated(true)}
            >
              Create preview record
            </Button>
          }
        />
      )}
    </div>
  );
}

export function Feedback() {
  return (
    <>
      <Section
        name="Alert"
        description="Inline messages with clear text, semantic tones and optional live announcements."
      >
        <Specimen>
          <div className="grid gap-4 md:grid-cols-2">
            {(["info", "success", "warning", "danger"] as const).map((tone) => (
              <Alert key={tone} tone={tone} title="Workspace update">
                Review the latest information for your workspace.
              </Alert>
            ))}
          </div>
        </Specimen>
        <Example>
          <AlertExample />
        </Example>
      </Section>
      <Section
        name="Toast"
        description="Completed-action feedback, with persistent actions and keyboard access through F8."
      >
        <Specimen>
          <div className="grid items-start gap-4 md:grid-cols-2">
            <ToastSpecimen action />
            <ToastSpecimen />
          </div>
        </Specimen>
        <Example>
          <ToastExample />
        </Example>
      </Section>
      <Section
        name="Progress"
        description="Determinate, complete, interrupted and indeterminate work with native progress semantics."
      >
        <Specimen>
          <div className="grid gap-4 md:grid-cols-2">
            {[0, 25, 50, 75, 100].map((value) => (
              <Progress
                key={value}
                label={value === 100 ? "Import complete" : "Importing records"}
                value={value}
              />
            ))}
            <Progress label="Import interrupted" value={50} error />
            <Progress label="Importing records" />
          </div>
        </Specimen>
        <Example>
          <ProgressExample />
        </Example>
      </Section>
      <Section
        name="Skeleton"
        description="Content-shaped placeholders with a quiet reduced-motion alternative."
      >
        <Specimen>
          <div className="grid items-start gap-4 md:grid-cols-2">
            <Skeleton />
            <Skeleton shape="metric" />
            <Skeleton shape="card" />
          </div>
        </Specimen>
        <Example>
          <LoadingExample />
        </Example>
      </Section>
      <Section
        name="EmptyState"
        description="A clear explanation and next action when a view has no content."
      >
        <Specimen>
          <EmptyStateGallery />
          <div className="max-w-[436px]">
            <EmptyState
              title="A fresh start."
              description="No records yet. Create your first one to give your team a place to begin."
              action={
                <Button
                  className="w-full"
                  leftIcon={<img src={add} alt="" />}
                  onClick={() =>
                    document
                      .getElementById("empty-state-example")
                      ?.scrollIntoView()
                  }
                >
                  Create record
                </Button>
              }
            />
          </div>
        </Specimen>
        <Example>
          <div id="empty-state-example">
            <EmptyExample />
          </div>
        </Example>
      </Section>
    </>
  );
}
