import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const origin = "http://127.0.0.1:4178";
const server = spawn(
  process.execPath,
  [
    "node_modules/vite/bin/vite.js",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "4178",
    "--strictPort",
  ],
  { stdio: "ignore", windowsHide: true },
);
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    if (server.exitCode !== null)
      throw new Error("Production preview exited early");
    try {
      ready = (await fetch(origin)).ok;
    } catch {
      /* Wait for the local preview only. */
    }
    if (ready) break;
    await delay(100);
  }
  assert(ready, "Production preview did not start");
  browser = await chromium.launch({
    channel: process.env.SUI_BROWSER_CHANNEL || undefined,
  });
  await mkdir("test-results/public-site", { recursive: true });
  for (const width of [392, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      reducedMotion: "reduce",
    });
    const violations = [];
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.exposeFunction("recordPolicyViolation", (directive) =>
      violations.push(directive),
    );
    await page.addInitScript(() => {
      localStorage.setItem("serenity-ui-theme", "dark");
      document.addEventListener("securitypolicyviolation", (event) => {
        window.recordPolicyViolation(event.violatedDirective);
      });
    });
    for (const route of [
      "home",
      "button",
      "signinform",
      "select",
      "dashboard",
    ]) {
      await page.goto(`${origin}/#${route}`);
      await page
        .locator(route === "home" ? "#main" : `#${route}`)
        .waitFor();
      assert.equal(
        await page.locator("html").getAttribute("data-sui-theme"),
        "dark",
      );


      if (route === "signinform") {
        await page.screenshot({
          path: `test-results/public-site/fields-${width}.png`,
        });
      }
    }
    assert.deepEqual(errors, [], "Production preview runtime errors");
    assert.deepEqual(
      violations,
      [],
      "The CSP must allow all legitimate preview resources",
    );
    await page.evaluate(() => {
      const script = document.createElement("script");
      script.textContent = "window.untrustedInlineScriptExecuted = true";
      document.body.appendChild(script);
    });
    assert.equal(
      await page.evaluate(() => window.untrustedInlineScriptExecuted),
      undefined,
    );
    await page.close();
  }
  for (const resource of [
    "/tokens/figma-tokens.json",
    "/src/index.ts",
    "/.env",
    "/serenity-ui-react-0.1.0.tgz",
  ]) {
    const response = await fetch(origin + resource);
    // Static SPA fallback may return index.html; it must never return a development-only file.
    assert(
      !response.ok ||
        response.headers.get("content-type")?.includes("text/html"),
      `Exposed resource: ${resource}`,
    );
  }
  console.log(
    "Production preview passed: desktop/mobile routes, Dark bootstrap, CSP enforcement and development-file probes.",
  );
} finally {
  await browser?.close();
  server.kill();
}
