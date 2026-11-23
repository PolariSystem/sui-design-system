import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "@serenity-ui/react/styles.css";
import "./styles.css";
import { RecordForm } from "./RecordForm";
import { RemoteRecords } from "./RemoteRecords";
import { PersistedDashboard } from "./PersistedDashboard";

function App() {
  const [revision, setRevision] = useState(0);
  return (
    <main className="integration-stack">
      <header>
        <h1>Application integration</h1>
        <p>
          Real HTTP requests, server validation and application-owned
          persistence.
        </p>
      </header>
      <p>
        This local example stores data in memory. Restarting the service resets
        it.
      </p>
      <RecordForm onCreated={() => setRevision((value) => value + 1)} />
      <RemoteRecords revision={revision} />
      <PersistedDashboard />
    </main>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
