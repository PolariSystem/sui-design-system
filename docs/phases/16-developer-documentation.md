# Phase 16 — Developer documentation and adoption

Date: 2026-11-23

## Delivered scope

Replace the documentation link grid with ten focused guides: getting started, installation, component API, themes, forms, application integration, uploads, motion, accessibility and updates. The existing shared shell owns desktop/mobile indexes, Light/Dark, search and adjacent navigation. Only the selected article mounts. Deep links, reload and browser history retain article focus. Documentation and its declarations load in a separate chunk when requested.

Generate API reference data and Markdown from the package's emitted declarations. The reference lists actual root exports for 55 modules and includes related local types without presenting them as additional exports. `docs:generate` rebuilds and regenerates; `docs:check` is part of the normal CI check and detects stale output. Runtime defaults remain linked to implementation and behavior guidance.

Publish an adoption guide and compile the exact form/upload recipes displayed in the workshop. Form examples make persistence an explicit typed application dependency and demonstrate validation, recovery and focus. Upload documentation distinguishes selection from transport and sent bytes from server acceptance. The real HTTP reference remains the executable example for remote data, versioned persistence and uploads. No learning path or task curriculum is introduced.

## Verification

Local verification on 2026-11-23:

| Check | Result |
| --- | --- |
| `npm run check` | Passed: type checking, library/CSS/declaration builds, API drift check, 127 tests across 19 files, workshop and public artifact checks |
| Upload, documentation, navigation and public-source browser suites | All 26 distinct checks passed across desktop/mobile Edge after updating the index expectation from 40 to 41 entries; the six affected upload/index checks passed again after the final focus/drop refinement |
| HTTP integration browser suite | 12 passed: server validation, retry, delayed-response cancellation, remote records, dashboard persistence and drag feedback |
| Packed consumer | Passed: isolated offline install, strict public declarations, 85 runtime exports, representative SSR/hydration, desktop/mobile selection/removal and compiled CSS without a Tailwind compiler |
| Production runtime policy | Passed: desktop/mobile routes, Dark bootstrap, CSP enforcement and development-file probes |
| Private website | Production build passed against the shared components and documentation; local website and HTTP example respond on ports 5173 and 5176 |
| Figma and visual review | Verified Light/Dark mobile compositions, growing text, token bindings and local nested component dependencies; inspected desktop/mobile upload and API screenshots |

The navigation regression was an outdated expected catalog count after adding FileUpload, not a missing route. A final focus refinement keeps the first transfer action mounted across Cancel/Retry transitions and restores picker focus after removal. The existing Vite advisory for the main workshop chunk above 500 kB remains; documentation is independently loaded, but this phase does not claim a complete bundle optimization.

GitHub's existing read-only checks workflow runs the complete browser suite and package verification for the pushed commit. No publishing job is added.

## Limitations

The package remains v0.2.0 with Unreleased changes; no npm publication or release is performed. The API reference is TypeScript declarations plus behavioral guides, not an exhaustive property-by-property prose manual. React is the only component adapter. Packed SSR/hydration coverage is representative and does not certify every framework, component, browser or assistive technology. The HTTP example is a development reference, not a production storage/authentication service.
