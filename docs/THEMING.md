# Light and Dark

Serenity uses the same components, geometry and motion in both appearances. Semantic color and effect aliases change; layouts, typography, spacing and behavior do not.

## Application boundary

Import `@serenity-ui/react/styles.css` once, then set the appearance on the document element:

```html
<html lang="en" data-sui-theme="dark">
```

Use `light` for the light appearance. The library defaults to Light when no boundary is provided. The application decides whether to follow the operating system and how to persist that preference; the React package does not read browser storage or require a theme provider.

Apply the attribute to `html` when using Dialog, Drawer, Select, Popover, Tooltip or DropdownMenu. Their portals mount under `body`, outside a nested preview container. A local `data-sui-theme` boundary is useful for static comparisons; it does not automatically theme portals outside that boundary.

```tsx
<div data-sui-theme="dark">
  <Card>
    <p>A local dark specimen.</p>
    <Button>Save changes</Button>
  </Card>
</div>
```

Frameworks other than React can consume the same CSS variables. Tailwind CSS 4 applications may import `@serenity-ui/react/theme.css` to use the shared theme; other applications use the compiled stylesheet. Avoid including both compiled and regenerated copies of the full component CSS.

## Website preference

The workshop and landing share `workshop/theme.tsx`. The icon button toggles Light/Dark directly, showing Sun in Light and Moon in Dark. The initial theme follows the browser silently; there is no visible System option. A small script in `index.html` resolves the appearance before paint. React follows browser theme changes until a manual selection, stores explicit selections under `serenity-ui-theme`, and synchronizes changes between tabs. If storage is unavailable, the current tab still works. This is website integration code, not a public component API.

The landing lives at `#home`; existing component links such as `#button` and `#chart` remain valid. Mobile landing navigation keeps the theme menu inside the hamburger panel. The Foundations page provides fixed Light and Dark comparisons.

## Semantic roles

- Surfaces separate the canvas, cards, hover states and selections. Elevated cards retain their shared effects in both themes.
- Text, icons and controls use their own foreground roles. Primary action backgrounds stay dark enough for their white labels; links and secondary/tertiary IconButton glyphs use a brighter blue in Dark.
- Status colors pair a surface with a foreground; text and icons also convey meaning.
- Charts pair each `color/chart/series/1…6` with `color/chart/foreground/1…6`. Do not assume a white label is readable on every series. Axes and semantic data stay final while decorative values animate from zero.
- Multicolor illustrations retain their original palette. The default Serenity logo uses the original white artwork in Dark and the colored artwork in Light, including nested theme boundaries. Inverse placements always use white. Logo geometry and consumer-supplied brands remain unchanged. Monochrome Solar control artwork uses its original alpha mask and semantic ink in Dark. Consumer-provided images are not recolored.

Control boundaries target 3:1 against the field surface. Normal text, action labels, status pairs and chart segment labels target 4.5:1. The token tests check defined foreground/background pairs; these checks do not certify arbitrary compositions or replace assistive-technology testing. Disabled controls and decorative separators have different contrast requirements.

## Figma and token maintenance

In Figma, set **Colors** and **Effects** to the same **Light** or **Dark** mode. Layout, Typography and Motion keep their existing shared values. Each component page has Components & variants above Usage examples, with Light and Dark aligned side by side. The original main components remain in a separate source container; review instances stay linked.

The Foundations theme reference lists semantic colors and resolved values in both modes. Icons and Playground have short usage guides while preserving their source catalogs and historical studies. Existing playground studies are not a second set of dark main components.

`tokens/figma-tokens.json` is the exported source of truth. `npm run tokens` regenerates `serenity-theme.css` and `token-manifest.json`; never edit generated CSS. The generator resolves aliases per mode, fails on broken or cyclic aliases, and redeclares semantic aliases at each boundary so nested comparisons resolve correctly.

When changing a role, update Figma first, export the changed variables, regenerate CSS, check contrast pairs, and verify the relevant default/hover/focus/selected states in both appearances. Keep comments, documentation and interface copy in English.
