import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Alert,
  Button,
  Card,
  CardFooter,
  Checkbox,
  Input,
  Select,
} from "@serenity-ui/react";
import { ApiError, errorMessage, requestJson } from "./api";
import { isRecord, type FieldErrors } from "./contracts";

export function RecordForm({ onCreated }: { onCreated: () => void }) {
  const nameRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLButtonElement>(null);
  const updatesRef = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);
  const [pending, setPending] = useState(false);
  const [fields, setFields] = useState<FieldErrors>({});
  const [feedback, setFeedback] = useState<{
    tone: "success" | "danger";
    message: string;
  } | null>(null);
  useEffect(() => () => request.current?.abort(), []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.current) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    const controller = new AbortController();
    request.current = controller;
    setPending(true);
    setFields({});
    setFeedback(null);
    try {
      await requestJson("/api/records", isRecord, {
        method: "POST",
        signal: controller.signal,
        body: JSON.stringify({
          name: values.get("name"),
          role: values.get("role"),
          updates: values.has("updates"),
        }),
      });
      if (controller.signal.aborted) return;
      form.reset();
      setFeedback({ tone: "success", message: "Workspace created." });
      onCreated();
    } catch (error) {
      if (controller.signal.aborted) return;
      setFeedback({ tone: "danger", message: errorMessage(error) });
      if (error instanceof ApiError) {
        setFields(error.fields);
        const first = error.fields.name
          ? nameRef
          : error.fields.role
            ? roleRef
            : error.fields.updates
              ? updatesRef
              : null;
        first?.current?.focus();
      }
    } finally {
      if (!controller.signal.aborted) setPending(false);
      if (request.current === controller) request.current = null;
    }
  }

  return (
    <Card padding="comfortable">
      <h2 className="text-sui-heading-xs">Create a workspace</h2>
      <form
        onSubmit={submit}
        aria-label="Create workspace"
        aria-busy={pending}
        className="integration-stack"
      >
        <Input
          ref={nameRef}
          name="name"
          label="Workspace name"
          required
          maxLength={80}
          error={fields.name}
        />
        <Select
          name="role"
          label="Access level"
          defaultValue="viewer"
          error={fields.role}
          triggerProps={{ ref: roleRef }}
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </Select>
        <Checkbox
          ref={updatesRef}
          name="updates"
          label="Receive updates"
          aria-invalid={Boolean(fields.updates) || undefined}
          aria-describedby={fields.updates ? "updates-error" : undefined}
        />
        {fields.updates && (
          <p
            id="updates-error"
            className="text-sui-body-sm text-sui-status-danger-foreground"
          >
            {fields.updates}
          </p>
        )}
        {feedback && (
          <Alert
            title={feedback.message}
            tone={feedback.tone}
            announcement="polite"
          />
        )}
        <CardFooter>
          <Button type="submit" loading={pending}>
            Create workspace
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
