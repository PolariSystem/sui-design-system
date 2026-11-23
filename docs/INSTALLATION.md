# Package integration

The complete package is MIT licensed. No npm registry release has been published yet; these instructions build and install an archive from the public repository.

## Create and install an archive

From the kit repository, install the locked dependencies with `npm ci`, then run:

```sh
npm run pack:local
```

The prepack hook regenerates tokens, checks TypeScript and rebuilds JavaScript, CSS and declarations before creating `serenity-ui-react-0.1.0.tgz` in the repository root. Install that file in a React 19 application:

```sh
npm install /absolute/path/to/serenity-ui-react-0.1.0.tgz
```

PowerShell users can use `npm.cmd` and quote paths containing spaces. Keep the archive outside Git; archive names reflect the package version, not the implementation phase. Rebuilding the same version replaces the local archive, so retain the package-check integrity when comparing builds.

## React and compiled CSS

```tsx
import { Button } from "@serenity-ui/react";
import "@serenity-ui/react/styles.css";

export function SaveAction() {
  return <Button onClick={() => savePreferences()}>Save preferences</Button>;
}
```

Import the compiled stylesheet once at the application root, before application overrides. It includes Tailwind Preflight, which resets native elements globally. The library does not require a Tailwind compiler in the consuming application. Load DM Sans separately for the approved typography; the workshop's self-hosted font is not bundled with the library. Until it is available, component typography uses the system sans-serif fallback. CSS variables are available for application-owned layout, such as `var(--sui-color-surface-canvas)` and `var(--sui-space-4)`.

React and React DOM are peer dependencies. Radix behavior primitives are ordinary runtime dependencies installed with the package. The build externalizes them and React; consumers must not alias a second React copy into their application. The package provides ESM, not CommonJS. Declaration checks currently cover TypeScript's `moduleResolution: "Bundler"`, with strict checking and `skipLibCheck: false`.

## Tailwind 4 and tokens

For applications that also compile their own Tailwind utilities, import the Serenity theme in the application's CSS after Tailwind:

```css
@import "tailwindcss";
@import "@serenity-ui/react/theme.css";
```

Continue to import `@serenity-ui/react/styles.css` once for the component rules and shared motion. Avoid using the raw theme as a replacement for those compiled component styles. Both stylesheets use the existing Tailwind layers; verify application overrides and reset interactions in the consuming application. A reset-free bundle is not currently provided.

`@serenity-ui/react/tokens.json` exposes the framework-independent Figma export for token tooling. Other frameworks can use tokens, but the component adapter currently requires React. Do not import private `dist` or source paths.

## Server-rendered applications

The package can be imported and representative components rendered in Node without DOM globals. Interactive components still require a client React boundary. In frameworks that distinguish Server and Client Components, import them inside an application-owned `"use client"` module. The package does not claim complete framework integration or hydration coverage from the Node rendering smoke check alone. Authentication, sessions, authorization and persistence belong to the application.

## Verify the deliverable

```sh
npm run check
npx playwright install chromium
npm run check:package
npm run test:browser
```

On Windows with Edge installed, set `$env:SUI_BROWSER_CHANNEL = 'msedge'` for browser checks. `check:package` creates a real archive, checks its contents, installs it into a temporary application outside the repository, verifies declarations and Node rendering, builds that application without Tailwind and exercises the production build at desktop/mobile widths. It uses the repository npm cache in offline mode; run `npm ci` first to populate that cache. The temporary installation is removed afterward. A report and screenshots remain in ignored `package-check-results/`.

The fixture lives in `tests/fixtures/package-consumer` and imports public package names only. It is intentionally excluded from the repository TypeScript program: only the independent consumer compilation validates it. Its committed lockfile fixes registry resolutions, using versions from the repository lock so a clean CI cache contains the required packages. Each run updates only the temporary lock entry for the locally rebuilt archive. After dependency upgrades, run `npm run check:package -- --refresh-lock` and review the fixture lock change. Refreshing also uses the repository cache and lock; neither mode publishes or requires registry access. This is a pinned integration check, not a supported-version matrix.

GitHub checks build the kit, verify the archive and run the browser suite on pushes and pull requests to main. The workflow has read-only repository permission and no publishing step. Registry releases and broader browser/assistive-technology validation remain separate maintainer work. Preserve LICENSE and THIRD-PARTY-NOTICES.md when redistributing.

Implementation references: [npm pack](https://docs.npmjs.com/cli/v11/commands/npm-pack/), [Vite library mode](https://vite.dev/guide/build.html#library-mode), [Playwright CI](https://playwright.dev/docs/ci-intro).
