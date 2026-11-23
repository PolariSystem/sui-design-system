import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./workshop.css";
import { Website } from "./Website";
import { SignInPreview } from "./Authentication";
import { ThemeProvider } from "./theme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      {new URLSearchParams(window.location.search).get("preview") ===
      "signin" ? (
        <main>
          <SignInPreview standalone />
        </main>
      ) : (
        <Website />
      )}
    </ThemeProvider>
  </StrictMode>,
);
