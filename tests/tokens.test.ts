import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import data from "../tokens/figma-tokens.json";
import manifest from "../tokens/token-manifest.json";

it("keeps every exported token reference resolvable and preserves agreed metrics", () => {
  const css = readFileSync("tokens/serenity-theme.css", "utf8");
  const declared = new Set(
    [...css.matchAll(/(--sui-[\w-]+)\s*:/g)].map((match) => match[1]),
  );
  expect(declared.size).toBe(data.variables.length);
  for (const match of css.matchAll(/var\((--sui-[\w-]+)/g))
    expect(declared.has(match[1]), match[1]).toBe(true);
  expect(css).toContain("--spacing: 0.25rem;");
  expect(css).toContain(
    "--sui-opacity-disabled: calc(var(--sui-primitive-opacity-percent-40) * 0.01);",
  );
  expect(css).toContain(
    "--sui-radius-md: calc(var(--sui-primitive-dimension-12) * 0.0625rem);",
  );
});

type Color = { r: number; g: number; b: number; a: number };
const luminance = ({ r, g, b }: Color) => {
  const linear = (value: number) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  return linear(r) * 0.2126 + linear(g) * 0.7152 + linear(b) * 0.0722;
};
const contrast = (a: Color, b: Color) => {
  const x = luminance(a),
    y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

it("provides readable semantic pairs in both themes without changing layout metrics", () => {
  const color = (role: string, mode: "resolved" | "dark") =>
    manifest.mappings.find((token) => token.css === `--sui-color-${role}`)![
      mode
    ] as Color;
  for (const mode of ["resolved", "dark"] as const) {
    const pairs: [string, string][] = [];
    for (const surface of ["default", "canvas", "muted", "hover", "selected"])
      for (const text of ["primary", "body", "secondary", "muted"])
        pairs.push([`text-${text}`, `surface-${surface}`]);
    for (const action of ["primary", "secondary", "danger"])
      for (const state of ["default", "hover", "pressed"])
        pairs.push([
          `action-${action}-foreground`,
          `action-${action}-${state}`,
        ]);
    for (const tone of ["info", "success", "warning", "danger"])
      pairs.push([`status-${tone}-foreground`, `status-${tone}-background`]);
    for (let i = 1; i <= 6; i++)
      pairs.push([`chart-foreground-${i}`, `chart-series-${i}`]);
    for (const [foreground, background] of pairs)
      expect(
        contrast(color(foreground, mode), color(background, mode)),
        `${mode}: ${foreground} on ${background}`,
      ).toBeGreaterThanOrEqual(4.5);
    expect(
      contrast(color("border-control", mode), color("surface-default", mode)),
    ).toBeGreaterThanOrEqual(3);
  }
  for (const token of manifest.mappings.filter((token) =>
    /--sui-(space|size|radius|padding|gap|type|motion)-/.test(token.css),
  ))
    expect(token.dark, token.name).toEqual(token.resolved);
});
