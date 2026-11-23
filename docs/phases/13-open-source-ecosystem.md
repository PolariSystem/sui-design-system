# Phase 13 — Open-source ecosystem

Started: 2026-11-20. Verification completed: 2026-11-23.

## Scope

One complete MIT-licensed design system, public component source and workshop documentation, plus a separate privately maintained website. The owner approved MIT and optional donations. No donation account is configured; the support action stays absent until a valid HTTPS destination is supplied.

## Structure

The public repository contains the React library, framework-independent tokens, public workshop, tests and technical documentation. The website consumes a sibling public checkout through explicit Vite aliases and a local package dependency. React is deduplicated. The shared workshop accepts an optional home composition; its default home is a public documentation entry point.

The private repository preserves the previous mixed project's history. The public repository begins with an MIT-only root commit followed by the complete kit snapshot, so website source cannot be retrieved from earlier public commits. No shared history was force-pushed.

## Verification

- Build, type checks, generated tokens and all 109 unit/component tests passed. DOM test concurrency is capped at two workers to avoid resource-related timeouts.
- Packed-consumer verification passed: declarations, 83 runtime exports, Node rendering and installed browser controls.
- Production workshop checks passed for desktop/mobile routing, theme bootstrap, CSP and development-only resource boundaries.
- The broader local browser run exercised 156 cases before interruption. After correcting the outdated default-route expectation and rerunning the affected suites, 27 passed and one intentional mobile animation skip remained. This local run was not a full uninterrupted pass; the separate [baseline CI run](https://github.com/PolariSystem/sui-design-system/actions/runs/45223747379) records the complete cloud regression.
- The separate website passed all 18 desktop/mobile browser checks, including theme persistence, FAQ, motion, responsive spacing and stable navigation geometry. Its build and type checks passed.
- The first cloud regression passed 152 browser cases with three intentional skips and found one login contrast-audit race: restored controls were still transitioning out of their disabled colors. The test now waits for the form's finite animations to finish before the audit, without disabling motion or weakening the contrast assertion. Six repeated desktop/mobile checks passed after the correction; subsequent cloud runs are available in repository Actions.
- Figma now has one complete main library: 17 redundant starter mirrors removed after dependency checks; four motion examples reconnected to canonical Button variants. The start page and website access actions reflect MIT. The standalone starter uses the same license and has no upgrade messaging. Changed start-page and website callout renders were reviewed, with an intrinsic-width badge correction applied.

## Repository migration

On November 23, 2026, the original repository was renamed to `PolariSystem/sui-website` and kept private. A new `PolariSystem/sui-design-system` repository was populated with the reviewed kit and made public. Remote tree and commit hashes were verified against both local checkouts. Anonymous access confirms the kit is public and the website repository is unavailable. The original history also has a local backup outside both repositories.

Both local `main` branches track their corresponding GitHub repositories. The website preview runs from the sibling `sui-website` folder and consumes the public kit. Website CI successfully builds both checkouts and runs the desktop/mobile regression suite.

No npm publication or donation collection is part of this migration. The support action remains absent until a verified HTTPS destination is configured. Figma content was updated without changing sharing permissions or publishing a Community listing.
