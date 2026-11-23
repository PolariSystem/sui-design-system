# Phase 13 — Open-source ecosystem

Started: 2026-11-20. Verification completed: 2026-11-23.

## Scope

One complete MIT-licensed design system, public component source and workshop documentation, plus a separate privately maintained website. The owner approved MIT and optional donations. No donation account is configured; the support action stays absent until a valid HTTPS destination is supplied.

## Structure

The public repository contains the React library, framework-independent tokens, public workshop, tests and technical documentation. The website consumes a sibling public checkout through explicit Vite aliases and a local package dependency. React is deduplicated. The shared workshop accepts an optional home composition; its default home is a public documentation entry point.

The private repository preserves the previous mixed project's history. The public repository begins with a new root commit so website source cannot be retrieved from earlier public commits. No shared history is force-pushed.

## Verification

- Build, type checks, generated tokens and all 109 unit/component tests passed. DOM test concurrency is capped at two workers to avoid resource-related timeouts.
- Packed-consumer verification passed: declarations, 83 runtime exports, Node rendering and installed browser controls.
- Production workshop checks passed for desktop/mobile routing, theme bootstrap, CSP and development-only resource boundaries.
- The broader browser run exercised 156 cases before interruption. After correcting the outdated default-route expectation and rerunning the affected suites, 27 passed and one intentional mobile animation skip remained. No full uninterrupted 156-case pass is claimed.
- The separate website passed all 18 desktop/mobile browser checks, including theme persistence, FAQ, motion, responsive spacing and stable navigation geometry. Its build and type checks passed.
- Figma now has one complete main library: 17 redundant starter mirrors removed after dependency checks; four motion examples reconnected to canonical Button variants. The start page and website access actions reflect MIT. The standalone starter uses the same license and has no upgrade messaging. Changed start-page and website callout renders were reviewed, with an intrinsic-width badge correction applied.

No npm publication or donation collection is part of this migration. The support action remains absent until a verified HTTPS destination is configured. Remote publication is the final migration step.
