# Developer adoption

The public workshop exposes one guide at a time under `#documentation`. Use its index for installation, the generated Component API, themes, forms, application integration, uploads, motion, accessibility and updates. The same guides are available from the private website because it consumes the shared workshop.

## Adopt the package

1. Check [implementation status](./STATUS.md) and [release notes](./releases/unreleased.md). The current adapter is React 19, ESM; other frameworks can consume tokens but do not have component adapters yet.
2. Follow [installation](./INSTALLATION.md) to build and install a local archive. No npm registry release is available. Choose the compiled stylesheet with Preflight, or the alternative entry when your application already supplies a compatible reset. Load DM Sans separately.
3. Put the Light/Dark boundary on `html` so portaled controls inherit it. Keep initial server and browser theme decisions consistent; see [theming](./THEMING.md).
4. Compose the shared controls and use [public API declarations](./API.md) for exact props and callback types. The reference lists actual root exports; related declarations are not additional supported entry points. Runtime defaults and behavior live in [component contracts](./COMPONENTS.md).
5. Connect your services through the boundaries described in [integration](./INTEGRATION.md) and [file upload](./FILE-UPLOAD.md). Run `npm run example:integration` to inspect real HTTP validation, remote tables, versioned dashboard saves and cancellable uploads.
6. Verify your content, theme overrides, keyboard flows, narrow layouts, errors and recovery. The kit's automation does not certify an application's permissions, backend, arbitrary compositions or every assistive technology.

## Executable recipes

- [ContactForm](../workshop/recipes/ContactForm.tsx) accepts a typed `save` function, reads native form data, preserves values, maps server field errors, restores focus and handles transport failure. The guide preview returns a local success result; it is explicitly not a service.
- [AttachmentSelection](../workshop/recipes/AttachmentSelection.tsx) selects a CSV file and restores focus after removal. It does not upload. The [HTTP queue](../examples/integration/UploadFiles.tsx) and [transport](../examples/integration/upload.ts) demonstrate progress, cancellation, retry and accepted-response handling.
- [RemoteRecords](../examples/integration/RemoteRecords.tsx) owns remote query state and supplies the visible page to DataTable. Stable row IDs and server totals remain application responsibilities.
- [PersistedDashboard](../examples/integration/PersistedDashboard.tsx) saves controlled layouts with version checks and confirms accepted writes through a top-right Toast.

The workshop imports recipe source with Vite's raw import to display exactly the TypeScript it compiles. Copy public package imports into your project, supply the service implementation and preserve error/focus behavior. Native form data does not include unchecked or disabled controls; multiple fields require `getAll`. FileUpload intentionally returns File objects rather than retaining a hidden native form value.

## Maintain the contract

After changing public types, run `npm run docs:generate`. It builds the package and generates `docs/API.md` and `workshop/generated/api-reference.json` from emitted declarations, including related local types. `npm run check` verifies those files against the new build; stale reference output fails CI. Do not edit generated API files manually.

Before pushing a completed change:

```sh
npm run check
npm run check:package
npm run test:browser
npm run test:integration
```

Run focused interaction checks during development. The packed consumer installs outside the repository and uses only public package exports; its strict type check and representative SSR/hydration tests catch dependencies on workspace-only source or configuration. See installation guidance for browser setup and Windows commands.

Record delivered changes, actual verification and limitations in a phase record and Unreleased notes. Do not equate a completed phase with a registry release. Review dependency and API changes before upgrading and retain MIT and third-party notices when distributing the kit.
