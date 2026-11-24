import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium, expect } from "@playwright/test";
import { preview } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(
  await readFile(path.join(root, "package.json"), "utf8"),
);
const npm = process.env.npm_execpath;
assert.ok(
  npm,
  "Run through npm run check:package so the active npm CLI is available.",
);
const scratchParent = await realpath(tmpdir());
const scratch = await mkdtemp(path.join(scratchParent, "serenity-package-"));
const results = path.join(root, "package-check-results");
const fixtureLock = path.join(
  root,
  "tests/fixtures/package-consumer/package-lock.json",
);
const refreshLock = process.argv.includes("--refresh-lock");
await mkdir(results, { recursive: true });
let server;
let browser;

function run(args, cwd = scratch) {
  const result = spawnSync(process.execPath, args, {
    cwd,
    encoding: "utf8",
    timeout: 180_000,
    maxBuffer: 8 * 1024 * 1024,
  });
  assert.equal(
    result.status,
    0,
    result.error?.message || result.stderr || result.stdout,
  );
  return result.stdout;
}

try {
  // The build already ran. Suppress the prepack hook here to avoid a duplicate build.
  const [packed] = JSON.parse(
    run(
      [
        npm,
        "pack",
        "--json",
        "--ignore-scripts",
        "--pack-destination",
        scratch,
      ],
      root,
    ),
  );
  const files = new Set(packed.files.map((file) => file.path));
  for (const file of [
    "package.json",
    "dist/serenity-ui.js",
    "dist/serenity-ui.css",
    "dist/serenity-ui-no-preflight.css",
    "dist/types/index.d.ts",
    "tokens/serenity-theme.css",
    "tokens/figma-tokens.json",
    "LICENSE",
    "README.md",
    "THIRD-PARTY-NOTICES.md",
    "docs/INSTALLATION.md",
  ]) {
    assert.ok(files.has(file), `Missing package file: ${file}`);
  }
  for (const file of files) {
    assert.ok(
      /^(dist\/|docs\/|tokens\/(figma-tokens\.json|serenity-theme\.css)$|package\.json$|LICENSE$|README\.md$|THIRD-PARTY-NOTICES\.md$)/.test(
        file,
      ),
      `Unexpected package file: ${file}`,
    );
    assert.ok(
      !/(^|\/)(node_modules|\.env|test-results|workshop)(\/|$)/.test(file),
      `Development-only file in package: ${file}`,
    );
  }
  assert.equal(
    manifest.license,
    "MIT",
    "The distributed package must retain the open-source license.",
  );
  assert.ok(
    manifest.sideEffects.includes("**/*.css"),
    "Consumers must retain the imported stylesheet.",
  );
  const output = await readFile(path.join(root, "dist/serenity-ui.js"), "utf8");
  // Catch undeclared runtime imports even if an unrelated consumer dependency could mask them.
  for (const [, specifier] of output.matchAll(/from\s+["']([^"']+)["']/g)) {
    const packageName = specifier.startsWith("@")
      ? specifier.split("/").slice(0, 2).join("/")
      : specifier.split("/")[0];
    assert.ok(
      manifest.dependencies?.[packageName] ||
        manifest.peerDependencies?.[packageName],
      `Undeclared runtime import: ${specifier}`,
    );
  }
  assert.ok(
    !output.includes("react.production"),
    "React must remain external.",
  );

  const consumer = path.join(scratch, "consumer");
  await cp(path.join(root, "tests/fixtures/package-consumer"), consumer, {
    recursive: true,
  });
  const consumerManifest = {
    name: "serenity-package-consumer",
    version: "0.0.0",
    private: true,
    type: "module",
    dependencies: {
      "@serenity-ui/react": `file:../${packed.filename}`,
      react: manifest.devDependencies.react,
      "react-dom": manifest.devDependencies["react-dom"],
    },
    devDependencies: Object.fromEntries(
      ["typescript", "vite", "@types/react", "@types/react-dom"].map((name) => [
        name,
        manifest.devDependencies[name],
      ]),
    ),
  };
  await writeFile(
    path.join(consumer, "package.json"),
    JSON.stringify(consumerManifest, null, 2),
  );
  await writeFile(
    path.join(consumer, "tsconfig.json"),
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          strict: true,
          noEmit: true,
          skipLibCheck: false,
          types: ["react", "react-dom", "vite/client"],
        },
        include: ["main.tsx"],
      },
      null,
      2,
    ),
  );
  // Only the local archive's identity changes on ordinary runs. Registry resolutions stay locked.
  // Refresh explicitly when upgrading the kit's runtime dependencies or the consumer tool versions.
  if (refreshLock) {
    // Seed known resolutions so the consumer also works with a fresh CI cache on another OS.
    const seed = JSON.parse(
      await readFile(path.join(root, "package-lock.json"), "utf8"),
    );
    seed.name = consumerManifest.name;
    seed.version = consumerManifest.version;
    seed.packages[""] = consumerManifest;
    await writeFile(
      path.join(consumer, "package-lock.json"),
      JSON.stringify(seed, null, 2),
    );
  } else {
    const lock = JSON.parse(await readFile(fixtureLock, "utf8"));
    for (const field of ["dependencies", "devDependencies"]) {
      assert.deepEqual(
        lock.packages[""][field],
        consumerManifest[field],
        "Consumer versions changed. Refresh its lock with npm run check:package -- --refresh-lock.",
      );
    }
    const entry = lock.packages["node_modules/@serenity-ui/react"];
    assert.deepEqual(
      entry.dependencies,
      manifest.dependencies,
      "Kit runtime dependencies changed. Refresh the consumer lock.",
    );
    assert.deepEqual(
      entry.peerDependencies,
      manifest.peerDependencies,
      "Kit peers changed. Refresh the consumer lock.",
    );
    Object.assign(entry, {
      version: manifest.version,
      integrity: packed.integrity,
      engines: manifest.engines,
    });
    await writeFile(
      path.join(consumer, "package-lock.json"),
      JSON.stringify(lock, null, 2),
    );
  }
  // No repository ancestor node_modules can satisfy missing dependencies in this temporary app.
  // Normal verification uses only the cache populated by npm ci and the committed consumer lock.
  console.log(
    `Installing the packed artifact into an isolated consumer (${refreshLock ? "refreshing lock" : "offline"}).`,
  );
  run(
    [
      npm,
      refreshLock ? "install" : "ci",
      "--offline",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--cache",
      path.join(root, ".npm-cache"),
    ],
    consumer,
  );
  if (refreshLock)
    await cp(path.join(consumer, "package-lock.json"), fixtureLock);
  run(
    ["node_modules/typescript/bin/tsc", "--project", "tsconfig.json"],
    consumer,
  );
  console.log(run(["ssr.mjs"], consumer).trim());
  run(["node_modules/vite/bin/vite.js", "build"], consumer);
  run(
    [
      "node_modules/vite/bin/vite.js",
      "build",
      "--ssr",
      "App.tsx",
      "--outDir",
      "ssr-dist",
    ],
    consumer,
  );
  run(["render-hydration.mjs"], consumer);
  server = await preview({
    root: consumer,
    configFile: false,
    preview: { host: "127.0.0.1", port: 0, open: false },
  });
  const address = server.httpServer.address();
  assert.ok(address && typeof address === "object");
  browser = await chromium.launch({
    channel: process.env.SUI_BROWSER_CHANNEL || undefined,
  });
  const hostPage = await browser.newPage();
  await hostPage.setContent(
    '<h1 id="host-heading">Existing application heading</h1><p id="host-copy">Existing copy</p>',
  );
  const hostMetrics = () =>
    hostPage.locator("#host-heading").evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        margin: style.margin,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
      };
    });
  const beforeStyles = await hostMetrics();
  await hostPage.addStyleTag({
    content: await readFile(
      path.join(root, "dist/serenity-ui-no-preflight.css"),
      "utf8",
    ),
  });
  assert.deepEqual(
    await hostMetrics(),
    beforeStyles,
    "No-Preflight styles reset native host headings.",
  );
  await hostPage.close();
  for (const [name, width, height] of [
    ["desktop", 1280, 900],
    ["mobile", 392, 852],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        /hydrat|server rendered|didn't match/i.test(message.text())
      )
        errors.push(message.text());
    });
    await page.goto(`http://127.0.0.1:${address.port}`);
    await expect(page.locator("html")).toHaveAttribute("data-hydrated", "true");
    await expect(page.locator("html")).not.toHaveAttribute(
      "data-hydration-error",
    );
    const button = page.getByRole("button", { name: "Save preferences" });
    await expect(button).toHaveCSS("min-height", "40px");
    await expect(button).toHaveCSS("background-color", "rgb(0, 111, 159)");
    await expect(button).toHaveCSS("font-family", /system-ui/);
    await button.click();
    await expect(
      page.getByRole("status").filter({ hasText: "Preferences saved." }),
    ).toHaveText("Preferences saved.");
    await page.getByRole("combobox", { name: "Access level" }).click();
    await page.getByRole("option", { name: "Editor", exact: true }).click();
    await expect(
      page.getByRole("combobox", { name: "Access level" }),
    ).toContainText("Editor");
    await page.getByRole("checkbox", { name: "Receive updates" }).check();
    await expect(
      page.getByRole("checkbox", { name: "Receive updates" }),
    ).toBeChecked();
    await page.getByRole("switch", { name: "Enable sync" }).click();
    await expect(
      page.getByRole("switch", { name: "Enable sync" }),
    ).toBeChecked();
    await expect(
      page.getByRole("heading", { name: "Password updated" }),
    ).toBeVisible();
    await page.locator('input[type="file"]').setInputFiles({
      name: "consumer.csv",
      mimeType: "text/csv",
      buffer: Buffer.from("name,team\nAda,Design"),
    });
    await expect(
      page.locator('.sui-file-upload-item[data-status="queued"]'),
    ).toContainText("consumer.csv");
    await page.getByRole("button", { name: "Remove consumer.csv" }).click();
    await expect(page.locator(".sui-file-upload-item")).toHaveCount(0);
    assert.ok(
      await page
        .locator("img")
        .evaluateAll(
          (images) =>
            images.length > 0 &&
            images.every((image) => image.complete && image.naturalWidth > 0),
        ),
      "Packaged SVG assets must load.",
    );
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      "Consumer overflows the viewport.",
    );
    assert.deepEqual(errors, [], "Consumer raised a browser error.");
    await page.screenshot({
      path: path.join(results, `${name}.png`),
      fullPage: true,
    });
    await page.close();
  }
  const report = {
    name: packed.name,
    version: packed.version,
    integrity: packed.integrity,
    packedBytes: packed.size,
    unpackedBytes: packed.unpackedSize,
    fileCount: packed.entryCount,
    checks: [
      "package contents",
      "declared runtime imports",
      "isolated offline install",
      "strict consumer declarations",
      "Node server rendering",
      "server markup hydration without recoverable errors",
      "no-Preflight stylesheet preserves native host headings",
      "Vite consumer build without Tailwind",
      "desktop and mobile interactions, CSS and assets",
    ],
    checkedAt: new Date().toISOString(),
  };
  await writeFile(
    path.join(results, "report.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(
    `Package checks passed: ${packed.entryCount} files, ${packed.size} packed bytes. Evidence: package-check-results/.`,
  );
} finally {
  await browser?.close();
  if (server)
    await new Promise((resolve, reject) =>
      server.httpServer.close((error) => (error ? reject(error) : resolve())),
    );
  // Only remove the exact directory created by mkdtemp, inside the resolved OS temp directory.
  assert.equal(path.dirname(path.resolve(scratch)), scratchParent);
  assert.ok(path.basename(scratch).startsWith("serenity-package-"));
  await rm(scratch, { recursive: true, force: true });
}
