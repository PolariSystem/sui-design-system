import { hydrateRoot } from "react-dom/client";
import { useEffect } from "react";
import { App } from "./App";
import "@serenity-ui/react/styles.css";
import "./styles.css";

function HydratedApp() {
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
  }, []);
  return <App />;
}
hydrateRoot(document.getElementById("root")!, <HydratedApp />, {
  onRecoverableError(error) {
    document.documentElement.dataset.hydrationError = String(error);
  },
});
