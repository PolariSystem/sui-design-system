# Serenity UI

An open-source design system for SaaS applications and dashboards. React + TypeScript components, framework-independent tokens, Light/Dark themes and editable Figma foundations share one visual language.

The complete kit is available under [MIT](./LICENSE). Contributions are welcome. No registry release has been published yet.

## Start locally

```sh
git clone https://github.com/PolariSystem/sui-design-system.git
cd sui-design-system
npm ci
npm run dev
```

Use Node.js 24.15 or another supported version from package.json. On PowerShell, use npm.cmd if needed. Open the address printed by Vite. The public workshop includes component states, working examples, foundations, motion and access-flow compositions.

## Project structure

- src/ — component implementation, styles and bundled artwork.
- tokens/ — framework-independent Figma tokens and generated Tailwind theme.
- workshop/ — public documentation, examples and reusable navigation shell.
- docs/ — API, installation, theming, motion and implementation status.
- tests/ — component, browser and packed-consumer checks.

## Build and verify

```sh
npm run check
npm run test:browser
npm run check:package
```

For browser checks, install Chromium with npx playwright install chromium. Package verification builds and installs a real archive into an isolated consumer. npm run pack:local creates an installable archive; it does not publish to a registry. See [installation](./docs/INSTALLATION.md).

## Documentation

- [Developer adoption](./docs/ADOPTION.md)
- [Generated API reference](./docs/API.md)
- [Component behavior](./docs/COMPONENTS.md)
- [File upload](./docs/FILE-UPLOAD.md)
- [Application integration](./docs/INTEGRATION.md)
- [Release notes](./docs/releases/0.2.0.md)
- [Theming](./docs/THEMING.md)
- [Motion](./docs/MOTION.md)
- [Implementation status](./docs/STATUS.md)
- [Contributing](./CONTRIBUTING.md)
- [Supporting the project](./SUPPORT.md)
- [Figma library](https://www.figma.com/design/2jnGtX6x5wYdoJDum40ovM/Serenity-UI---Design-System)

React is the first adapter. Vue, Angular, Svelte and Astro adapters are not implemented. Shared tokens are framework independent. Authentication callbacks integrate with your own backend; the workshop uses local simulations.

## License and attribution

Serenity code and original design resources are MIT licensed. Solar icon artwork and other third-party assets keep their original licenses and attribution requirements; see [third-party notices](./THIRD-PARTY-NOTICES.md). The product website is maintained separately and is not included in this repository.
