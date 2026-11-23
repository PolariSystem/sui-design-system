# Phase 14 — Developer integration

Delivered: 2026-11-23. Version: 0.2.0. Implementation and local verification complete; GitHub release publication requires the exact commit's CI checks to pass.

## Objective

Make the existing React adapter easier to connect to application-owned services, with executable evidence rather than implied backend support. Preserve the approved appearance and keep the library independent of transport, authentication provider and form library.

## Delivery method

1. Inspect public contracts and reproduce integration gaps.
2. Make focused, backwards-compatible component changes with regression tests.
3. Exercise a real HTTP service through an example application: validation, cancellation, remote sorting/pagination and dashboard persistence.
4. Verify distribution, server rendering/hydration and stylesheet choices.
5. Document contracts, actual checks and limitations; commit reviewed changes, verify GitHub Actions and publish release notes.

Each delivery records its evidence here. A passing visual demo alone is not integration verification. Registry publishing is outside this phase.

## Acceptance criteria

- Native controls retain form semantics and expose usable focus refs, including Checkbox.
- Pickers expose visible-trigger integration without changing their staged value behavior.
- Consumers can choose CSS without Tailwind Preflight.
- The HTTP example handles server errors and stale requests and persists dashboard changes across page reloads while its server remains running.
- Representative server-rendered controls hydrate without recoverable errors and remain interactive.
- The packed package passes strict consumer type checking and browser verification.
- Documentation states which guarantees are tested and which features remain application responsibilities.

## Boundaries

The reference service is a local, in-memory integration example, not a production identity system or database. Authorization, secure sessions, durable storage, rate limiting and deployment belong to the consuming application. Additional framework adapters, file upload, task Kanban and exhaustive framework/browser certification remain separate work.

## Delivered changes

- Added native Checkbox refs and shared stable ref composition with React 19 cleanup support; applied it to Select triggers as well.
- Added DatePicker/TimePicker `triggerProps` without changing Apply, native reset or serialized value behavior.
- Added a second CSS build from the same component sources, excluding Tailwind Preflight. Existing stylesheet imports remain unchanged.
- Added the reference HTTP application with validated request/response contracts, field errors, remote queries, cancellation and versioned dashboard persistence.
- Extended the isolated installed consumer with actual SSR-to-browser hydration, public ref declarations and no-Preflight host-style verification.
- Added [application integration](../INTEGRATION.md), [release methodology](../RELEASING.md), [0.2.0 release notes](../releases/0.2.0.md) and a workshop navigation entry for integration.
- Added a separate GitHub Actions integration job. The existing full workshop regression job remains enabled; no accessibility or behavioral assertions were removed.

## Verification record

Local verification on 2026-11-23:

| Check | Result |
| --- | --- |
| `npm run check` | Passed: type checking, both CSS builds, declarations, 120 tests across 17 files, workshop production build and public artifact checks |
| Packed consumer (`scripts/check-package.mjs`, after build) | Passed: isolated offline install, strict consumer types, 83 runtime exports, SSR/hydration, desktop/mobile interactions and no-Preflight host-style check |
| `npm run test:integration` | Passed: 6 desktop/mobile browser scenarios against the local HTTP service, including server validation, remote pagination/sort, cancellation, retries, persistence and conflicts |
| Focused workshop browser regression | Passed: 40 checks covering form controls, single/multiple selects, motion, overlays and pickers on desktop/mobile Edge; isolated port 5177 |
| Private website compatibility | `npm run build` passed against the shared updated source; no website-only files copied to the public kit |
| Diff hygiene | `git diff --check` passed; generated tokens unchanged |

The HTTP unit checks use real network requests. Browser retry and stale-response tests deliberately intercept selected requests to reproduce failures. Tests initially caught an overbroad development proxy that intercepted `api.ts`; the proxy now matches only `/api/` routes. Browser selectors were corrected to match the existing accessible names rather than changing the component UI.

The production workshop still emits the existing Vite advisory for a chunk above 500 kB. This phase does not claim to solve route-level code splitting. The no-Preflight entry is not style isolation, and application-owned base styles remain required.

The [GitHub release](https://github.com/PolariSystem/sui-design-system/releases/tag/v0.2.0) records the release commit and exact successful verification run. No npm registry publication is included in this phase.

## CI follow-up — 2026-11-23

The first full cloud run passed integration, packaging and 150 workshop checks, but failed three browser checks (with three pre-existing skips). Two failures came from the documentation index's old five-link expectation after adding the sixth guide. The navigation test now verifies the new integration destination, its focus and its source link. The third failure measured the two-step verification actions during their disabled-to-enabled color transition; its accessibility audit now waits for pending state and finite form animations to settle, as the sign-in audit already does. Contrast rules remain enabled, and product motion is unchanged. The release remains gated on a successful complete run of the follow-up commit.

Follow-up validation: TypeScript and diff checks passed. Both affected scenarios passed twice on desktop and mobile (8 browser checks), with motion and all accessibility rules enabled.
