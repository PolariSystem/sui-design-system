import fs from "node:fs";
// The approved Figma export is the source of truth. Generated CSS is not edited by hand.
const data = JSON.parse(
  fs.readFileSync(new URL("./figma-tokens.json", import.meta.url), "utf8"),
);
const vars = new Map(data.variables.map((v) => [v.id, v]));
const primitive = data.collections.find((c) => c.name.startsWith("01")).id;
const number = (x) => Number(x.toFixed(6));
const name = (v) => v.css.slice(4, -1);
const slug = (value) => value.replace(/^SUI \/ /, "").replaceAll("/", "-");
function rawValue(v, mode = "Light") {
  const collection = data.collections.find((c) => c.id === v.collection);
  const selected =
    collection.modes.find((m) => m.name === mode) ?? collection.modes[0];
  if (!(selected.modeId in v.values))
    throw Error(`Missing ${mode} value for ${v.name}`);
  return v.values[selected.modeId];
}
function resolve(v, seen = new Set(), mode = "Light") {
  // Resolve each alias chain independently and fail before writing output if it is broken.
  if (!v || seen.has(v.id)) throw Error("Broken or cyclic token alias");
  seen.add(v.id);
  const raw = rawValue(v, mode);
  return raw?.type === "VARIABLE_ALIAS"
    ? resolve(vars.get(raw.id), seen, mode)
    : raw;
}
function rgba(c) {
  return (
    "rgb(" +
    [c.r, c.g, c.b].map((x) => number(x * 255)).join(" ") +
    " / " +
    number(c.a ?? 1) +
    ")"
  );
}
function unit(v) {
  // Primitives stay unitless because one number may serve different physical quantities.
  // Semantic tokens provide rem for layout/type and px for borders, effects and tracking.
  if (v.collection === primitive || v.type !== "FLOAT") return "";
  if (
    v.scopes.includes("EFFECT_FLOAT") ||
    v.scopes.includes("STROKE_FLOAT") ||
    v.name.startsWith("border/")
  )
    return "px";
  if (
    v.scopes.some((s) =>
      [
        "GAP",
        "WIDTH_HEIGHT",
        "CORNER_RADIUS",
        "FONT_SIZE",
        "LINE_HEIGHT",
      ].includes(s),
    )
  )
    return "rem";
  if (v.name.startsWith("breakpoint/")) return "rem";
  if (v.scopes.includes("LETTER_SPACING")) return "px";
  return "";
}
function literal(v, mode = "Light") {
  const x = resolve(v, new Set(), mode);
  if (v.type === "COLOR") return rgba(x);
  if (v.type === "STRING") return JSON.stringify(x);
  if (v.type === "BOOLEAN") return x ? "1" : "0";
  if (v.type === "TIMING") return number(x) + "s";
  if (v.type === "EASING") {
    const b = x.easingFunctionCubicBezier;
    return b
      ? "cubic-bezier(" + [b.x1, b.y1, b.x2, b.y2].map(number).join(", ") + ")"
      : "linear";
  }
  const u = unit(v);
  return number(u === "rem" ? x / 16 : x) + u;
}
function definition(v, mode = "Light") {
  const raw = rawValue(v, mode);
  if (raw?.type !== "VARIABLE_ALIAS") return literal(v, mode);
  const target = vars.get(raw.id);
  const reference = "var(" + name(target) + ")";
  const u = unit(v);
  // Figma stores opacity as 0–100; CSS expects a fraction between 0 and 1.
  if (v.scopes.includes("OPACITY")) return "calc(" + reference + " * 0.01)";
  if (v.type === "FLOAT" && u && target.collection === primitive)
    return (
      "calc(" + reference + " * " + (u === "rem" ? "0.0625rem" : "1px") + ")"
    );
  return reference;
}
const root = data.variables.map(
  (v) => "  " + name(v) + ": " + definition(v) + ";",
);
// Re-declare semantic aliases at each theme boundary. Inherited custom properties
// resolve where declared, so overriding primitives alone breaks nested themes.
const semantic = data.variables.filter((v) => v.collection !== primitive);
const modeBlock = (mode) =>
  semantic
    .map((v) => "  " + name(v) + ": " + definition(v, mode) + ";")
    .join("\n");
const themes =
  '\n[data-sui-theme="light"] {\n  color-scheme: light;\n' +
  modeBlock("Light") +
  '\n}\n[data-sui-theme="dark"] {\n  color-scheme: dark;\n' +
  modeBlock("Dark") +
  "\n}\n";
// Resolve responsive aliases at every theme boundary, including nested previews.
// Only heading size and leading change; body text and controls stay legible.
const mobileTypography = data.variables
  .filter((v) => /^type\/mobile\/.*\/(size|line-height)$/.test(v.name))
  .map((v) => "    " + name(v).replace("-mobile-", "-") + ": " + v.css + ";")
  .join("\n");
const mobileBreakpoint = data.variables.find((v) => v.name === "breakpoint/sm");
const responsive =
  "\n@media (width < " +
  resolve(mobileBreakpoint) / 16 +
  "rem) {\n  :root, [data-sui-theme] {\n" +
  mobileTypography +
  "\n  }\n}\n";
// Consumers load DM Sans separately; keep a sans-serif fallback until that font is available.
const theme = [
  "  --font-sui: var(--sui-type-body-md-family), ui-sans-serif, system-ui, sans-serif;",
];
for (const v of data.variables.filter((v) => v.collection !== primitive)) {
  const n = slug(v.name);
  if (v.type === "COLOR" && v.name.startsWith("color/"))
    theme.push("  --color-sui-" + n.slice(6) + ": " + v.css + ";");
  if (v.name.startsWith("radius/"))
    theme.push("  --radius-sui-" + n.slice(7) + ": " + v.css + ";");
  if (/^(size|gap|padding|space)\//.test(v.name))
    theme.push("  --spacing-sui-" + n + ": " + v.css + ";");
  if (v.name.startsWith("motion/easing/"))
    theme.push(
      "  --ease-sui-" + n.slice("motion-easing-".length) + ": " + v.css + ";",
    );
}
for (const s of data.textStyles) {
  const key = slug(s.name);
  const bound = (field) => vars.get(s.bound[field]?.id)?.css;
  theme.push(
    "  --text-sui-" +
      key +
      ": " +
      (bound("fontSize") || s.size / 16 + "rem") +
      ";",
  );
  theme.push(
    "  --text-sui-" +
      key +
      "--line-height: " +
      (bound("lineHeight") || s.lineHeight.value / 16 + "rem") +
      ";",
  );
  theme.push(
    "  --text-sui-" +
      key +
      "--font-weight: " +
      (bound("fontWeight") ||
        (/SemiBold/.test(s.font.style)
          ? 600
          : /Medium/.test(s.font.style)
            ? 500
            : 400)) +
      ";",
  );
  theme.push(
    "  --text-sui-" +
      key +
      "--letter-spacing: " +
      (bound("letterSpacing") || "0px") +
      ";",
  );
}
for (const s of data.effectStyles) {
  const key = slug(s.name);
  const shadows = s.effects.filter(
    (e) => e.type === "DROP_SHADOW" || e.type === "INNER_SHADOW",
  );
  if (shadows.length) {
    const value = shadows
      .map((e) => {
        const b = (field, fallback) =>
          vars.get(e.boundVariables?.[field]?.id)?.css || fallback;
        return (
          (e.type === "INNER_SHADOW" ? "inset " : "") +
          [
            b("offsetX", e.offset.x + "px"),
            b("offsetY", e.offset.y + "px"),
            b("radius", e.radius + "px"),
            b("spread", e.spread + "px"),
            b("color", rgba(e.color)),
          ].join(" ")
        );
      })
      .join(", ");
    theme.push("  --shadow-sui-" + key + ": " + value + ";");
  } else {
    const e = s.effects[0];
    if (e)
      theme.push(
        "  --blur-sui-" +
          key.replace(/^blur-/, "") +
          ": " +
          (vars.get(e.boundVariables?.radius?.id)?.css || e.radius + "px") +
          ";",
      );
  }
}
// Breakpoints must resolve to literal lengths because CSS variables cannot drive media queries.
const fixed = [
  "  --spacing: 0.25rem;",
  ...data.variables
    .filter((v) => v.name.startsWith("breakpoint/"))
    .map(
      (v) =>
        "  --breakpoint-" +
        v.name.split("/")[1] +
        ": " +
        number(resolve(v) / 16) +
        "rem;",
    ),
];
const css =
  "/* Generated from Figma, " +
  data.date +
  ". Tailwind " +
  data.tailwindVersion +
  ". Regenerate; do not hand-edit. */\n" +
  "/* Load DM Sans in the application. Primitive floats remain unitless; semantic aliases provide units. */\n" +
  ":root {\n" +
  root.join("\n") +
  "\n  color-scheme: light;\n}\n" +
  themes +
  responsive +
  "\n@theme {\n" +
  fixed.join("\n") +
  "\n}\n\n@theme inline {\n" +
  theme.join("\n") +
  "\n}\n";
fs.writeFileSync(new URL("./serenity-theme.css", import.meta.url), css);
fs.writeFileSync(
  new URL("./token-manifest.json", import.meta.url),
  JSON.stringify(
    {
      generatedAt: data.date,
      tailwind: data.tailwindVersion,
      variables: data.variables.length,
      textStyles: data.textStyles.length,
      effectStyles: data.effectStyles.length,
      modes: ["Light", "Dark"],
      primitiveFloatContract:
        "Unitless; semantic dimensional aliases apply rem/px.",
      mappings: data.variables.map((v) => ({
        name: v.name,
        css: name(v),
        resolved: resolve(v),
        dark: resolve(v, new Set(), "Dark"),
        unit: unit(v),
      })),
    },
    null,
    2,
  ),
);
console.log(
  "Generated " +
    data.variables.length +
    " tokens, " +
    data.textStyles.length +
    " text styles and " +
    data.effectStyles.length +
    " effect styles.",
);
