import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const declarations = path.join(root, "dist/types");
const index = await readFile(path.join(declarations, "index.d.ts"), "utf8");
// Read only compiler-emitted module specifiers; TypeScript remains the authority
// for the declarations themselves. This does not attempt to parse or infer props.
const modules = [
  ...new Set([...index.matchAll(/from "(\.[^"]+)"/g)].map((match) => match[1])),
].sort();
async function declarationTree(specifier, seen = new Set()) {
  const filename = path.resolve(declarations, `${specifier}.d.ts`);
  if (!filename.startsWith(`${declarations}${path.sep}`))
    throw new Error("Declaration escaped the package boundary.");
  if (seen.has(filename)) return "";
  seen.add(filename);
  const source = (await readFile(filename, "utf8")).trim();
  const related = [];
  for (const match of source.matchAll(
    /(?:from|import)\s*["'](\.[^"']+)["']/g,
  )) {
    const target = path
      .relative(declarations, path.resolve(path.dirname(filename), match[1]))
      .replaceAll(path.sep, "/");
    const content = await declarationTree(target, seen);
    if (content) related.push(content);
  }
  return [
    `// ${path.relative(declarations, filename).replaceAll(path.sep, "/")}`,
    source,
    ...related,
  ].join("\n\n");
}
const entries = await Promise.all(
  modules.map(async (module) => ({
    name: path.basename(module),
    exports: [...index.matchAll(/export(?: type)? \{([^}]+)\} from "([^"]+)"/g)]
      .filter((match) => match[2] === module)
      .flatMap((match) =>
        match[1]
          .split(",")
          .map((name) => name.trim().replace(/^type /, ""))
          .filter(Boolean),
      ),
    source: `src/${module.slice(2)}${module.endsWith(".types") ? ".ts" : ".tsx"}`,
    declaration: await declarationTree(module),
  })),
);
const json = `${JSON.stringify(entries, null, 2)}\n`;
const markdown = [
  "# Public API reference",
  "",
  "Generated from the package declarations. Run `npm run docs:generate` after changing a public contract; `npm run check` rejects stale output. Import public names from `@serenity-ui/react`, not the relative paths shown inside declaration files. Related local types are included below their declaring module. Runtime defaults and interaction guidance live in [component behavior](./COMPONENTS.md), [integration](./INTEGRATION.md) and [file upload](./FILE-UPLOAD.md).",
  "",
  ...entries.flatMap((entry) => [
    `## ${entry.name}`,
    "",
    `Public exports: ${entry.exports.map((name) => `\`${name}\``).join(", ")}. Other declarations below are related module details, not additional root exports.`,
    "",
    `[Implementation](../${entry.source})`,
    "",
    "```ts",
    entry.declaration,
    "```",
    "",
  ]),
].join("\n");
for (const [relative, content] of [
  ["workshop/generated/api-reference.json", json],
  ["docs/API.md", markdown],
]) {
  const filename = path.join(root, relative);
  if (process.argv.includes("--check")) {
    const current = await readFile(filename, "utf8").catch(() => "");
    if (current.replaceAll("\r\n", "\n") !== content)
      throw new Error(`${relative} is stale. Run npm run docs:generate.`);
  } else {
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, content);
  }
}
console.log(
  `Public API reference ${process.argv.includes("--check") ? "verified" : "generated"}: ${entries.length} modules.`,
);
