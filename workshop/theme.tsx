import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { IconButton } from "../src";
import sun from "./assets/site-sun.svg";
import moon from "./assets/site-moon.svg";

export type ThemePreference = "light" | "dark" | "system";
const storageKey = "serenity-ui-theme";
const valid = (value: unknown): value is ThemePreference =>
  value === "light" || value === "dark" || value === "system";
function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(storageKey);
    return valid(stored) ? stored : "system";
  } catch {
    return "system";
  }
}
const ThemeContext = createContext({
  preference: "system" as ThemePreference,
  resolved: "light" as "light" | "dark",
  setPreference: (_: ThemePreference) => {},
});

/** Website-level preference. The library itself only requires data-sui-theme on a root. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState(readPreference);
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const resolved =
    preference === "system" ? (systemDark ? "dark" : "light") : preference;
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    const sync = (event: StorageEvent) => {
      if (event.key === storageKey || event.key === null)
        setPreference(readPreference());
    };
    media.addEventListener("change", update);
    window.addEventListener("storage", sync);
    update();
    return () => {
      media.removeEventListener("change", update);
      window.removeEventListener("storage", sync);
    };
  }, []);
  useEffect(() => {
    // The document boundary also covers Radix portals mounted under body.
    document.documentElement.dataset.suiTheme = resolved;
    document.documentElement.style.colorScheme = resolved;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", resolved === "dark" ? "#0b1620" : "#f3f6f8");
  }, [resolved]);
  const choose = (next: ThemePreference) => {
    setPreference(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      /* Storage may be unavailable; the current tab still follows the selection. */
    }
  };
  return (
    <ThemeContext value={{ preference, resolved, setPreference: choose }}>
      {children}
    </ThemeContext>
  );
}
export const useTheme = () => useContext(ThemeContext);

/** Begin with the browser theme; a manual toggle persists an explicit override. */
export function ThemeSelector() {
  const { resolved, setPreference } = useTheme();
  const next = resolved === "light" ? "dark" : "light";
  return (
    <IconButton
      variant="secondary"
      aria-label={`Switch to ${next} theme`}
      onClick={() => setPreference(next)}
      icon={
        resolved === "light" ? (
          <img src={sun} alt="" className="site-theme-icon" />
        ) : (
          <span
            aria-hidden="true"
            className="site-icon"
            style={{ maskImage: `url("${moon}")` }}
          />
        )
      }
    />
  );
}
