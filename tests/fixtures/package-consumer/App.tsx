import { useRef, useState } from "react";
import {
  Button,
  Card,
  CardFooter,
  Checkbox,
  Select,
  Switch,
  DatePicker,
  TimePicker,
  EmptyState,
  AuthScreen,
  type AuthScreenState,
  type ButtonProps,
} from "@serenity-ui/react";

// This consumer has no Tailwind plugin and no access to the library's source tree.
const buttonProps = { variant: "primary", size: "md" } satisfies ButtonProps;
const authScreen: AuthScreenState = {
  step: "password-updated",
  signInHref: "#root",
};

export function App() {
  const [saved, setSaved] = useState(false);
  const [role, setRole] = useState("viewer");
  const updatesRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLButtonElement>(null);
  const timeRef = useRef<HTMLButtonElement>(null);
  return (
    <main>
      <h1>Installed package preview</h1>
      <Card padding="comfortable">
        <h2>Workspace preferences</h2>
        <Select label="Access level" value={role} onValueChange={setRole}>
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </Select>
        <Checkbox ref={updatesRef} label="Receive updates" />
        <DatePicker
          label="Start date"
          defaultMonth="2026-11"
          triggerProps={{ ref: dateRef }}
        />
        <TimePicker label="Start time" triggerProps={{ ref: timeRef }} />
        <Switch label="Enable sync" />
        <CardFooter>
          <Button {...buttonProps} onClick={() => setSaved(true)}>
            Save preferences
          </Button>
        </CardFooter>
        <p role="status">{saved ? "Preferences saved." : ""}</p>
      </Card>
      <EmptyState
        title="No records yet"
        description="New records will appear here."
        illustration="content"
      />
      <AuthScreen screen={authScreen} headingLevel={2} animated={false} />
    </main>
  );
}
