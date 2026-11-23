import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { Toast, ToastProvider, ToastViewport } from "@serenity-ui/react";
import "@serenity-ui/react/styles.css";
import "./styles.css";
import { RecordForm } from "./RecordForm";
import { RemoteRecords } from "./RemoteRecords";
import { PersistedDashboard } from "./PersistedDashboard";

function App() {
  const [revision, setRevision] = useState(0);
  const [notification, setNotification] = useState(0);
  return (
    <ToastProvider>
      <main className="integration-page integration-stack">
        <header>
          <h1 className="integration-title">Application integration</h1>
          <p>
            Real HTTP requests, server validation and application-owned
            persistence.
          </p>
        </header>
        <p>
          This local example stores data in memory. Restarting the service
          resets it.
        </p>
        <RecordForm onCreated={() => setRevision((value) => value + 1)} />
        <RemoteRecords revision={revision} />
        <PersistedDashboard
          onSaved={() => setNotification((value) => value + 1)}
        />
      </main>
      {notification > 0 && (
        <Toast
          key={notification}
          title="Dashboard saved."
          type="foreground"
          dismissible
        />
      )}
      <ToastViewport position="top-right" />
    </ToastProvider>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
