import { readdir, readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import path from "node:path";

const root = path.resolve("workshop-dist");
const allowed =
  /^(?:index\.html|_headers|assets\/[\w.-]+\.(?:js|css|svg|png|webp|woff2))$/;
const forbidden = [
  /sourceMappingURL|sourcesContent/,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}/,
];

/** Inspect the artifact we ship, not a hidden DOM element or a client-side entitlement flag. */
async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await inspect(fullPath);
      continue;
    }
    const relative = path.relative(root, fullPath).replaceAll("\\", "/");
    assert(allowed.test(relative), `Unexpected public file: ${relative}`);
    if (/\.(?:js|css|html|svg)$/.test(relative)) {
      const source = await readFile(fullPath, "utf8");
      for (const pattern of forbidden)
        assert(
          !pattern.test(source),
          `Sensitive content in ${relative}: ${pattern}`,
        );
    }
  }
}
await inspect(root);
const html = await readFile(path.join(root, "index.html"), "utf8");
assert(
  html.includes('http-equiv="Content-Security-Policy"'),
  "Production CSP is missing",
);
assert(
  html.includes("sha256-"),
  "Pre-paint script must have an exact CSP hash",
);
const headers = await readFile(path.join(root, "_headers"), "utf8");
assert(
  headers.includes("default-src 'self'") &&
    headers.includes("frame-ancestors 'none'"),
);
console.log(
  "Public artifact checked: expected assets, no embedded credentials, and production CSP. Source and documentation are intentionally public.",
);
