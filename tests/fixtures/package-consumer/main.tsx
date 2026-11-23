import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Button,
  Card,
  CardFooter,
  Checkbox,
  Select,
  Switch,
  EmptyState,
  AuthScreen,
  type AuthScreenState,
  type ButtonProps,
} from "@serenity-ui/react";
import "@serenity-ui/react/styles.css";
import "./styles.css";

// This consumer has no Tailwind plugin and no access to the library's source tree.
const buttonProps = { variant: "primary", size: "md" } satisfies ButtonProps;
const authScreen: AuthScreenState = {
  step: "password-updated",
  signInHref: "#root",
};

function App() {
  const [saved, setSaved] = useState(false);
  const [role, setRole] = useState("viewer");
  return (
    <main>
      <h1>Installed package preview</h1>
      <Card padding="comfortable">
        <h2>Workspace preferences</h2>
        <Select label="Access level" value={role} onValueChange={setRole}>
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </Select>
        <Checkbox label="Receive updates" />
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

createRoot(document.getElementById("root")!).render(<App />);
