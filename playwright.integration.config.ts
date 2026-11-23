import { defineConfig, devices } from "@playwright/test";
const port = Number(process.env.SUI_INTEGRATION_PORT ?? 5176);

export default defineConfig({
  testDir: "tests/integration-browser",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    launchOptions: { channel: process.env.SUI_BROWSER_CHANNEL || undefined },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "mobile",
      use: { ...devices["iPhone 13"], defaultBrowserType: "chromium" },
    },
  ],
  webServer: {
    command: "node examples/integration/dev.mjs",
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
