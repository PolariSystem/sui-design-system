import { Button, Card, CardFooter, Input } from "../src";
import { useTheme } from "./theme";

/** Fixed local boundaries make the two appearances comparable under either website preference. */
export function ThemeReference() {
  const { setPreference } = useTheme();
  return (
    <div className="mb-8 flex flex-col gap-4">
      <h2 className="text-sui-heading-sm">One system, two appearances</h2>
      <p className="text-sui-body-md text-sui-text-secondary">
        Colors and elevation adapt to the surface. Typography, spacing, states
        and motion stay consistent. Use the theme button in the header to switch
        between Light and Dark.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {(["light", "dark"] as const).map((mode) => (
          <div
            key={mode}
            data-sui-theme={mode}
            className="rounded-sui-lg bg-sui-surface-canvas p-4"
            data-theme-preview={mode}
          >
            <Card>
              <h3 className="text-sui-heading-xs">
                {mode === "light" ? "Light" : "Dark"}
              </h3>
              <p className="text-sui-body-sm text-sui-text-secondary">
                The same semantic roles, in context.
              </p>
              <Input
                label={`${mode === "light" ? "Light" : "Dark"} workspace`}
                defaultValue="Serenity workspace"
                readOnly
              />
              <CardFooter>
                <Button onClick={() => setPreference(mode)}>
                  Use {mode} theme
                </Button>
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
      <a className="docs-text-link" href="#documentation/theming">
        Read the theming guide →
      </a>
    </div>
  );
}
