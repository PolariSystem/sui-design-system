# Phase 15 — Integration interaction polish

Date: 2026-11-23

## Scope

Address feedback from the executable HTTP example: inconsistent dialog typography, inline dashboard-save confirmation and insufficient spatial feedback while dragging widgets. Apply shared interaction changes to both the compact editor and live workshop dashboard.

## Implementation

- Load DM Sans in the reference app, use the real theme font token and scope host heading/layout CSS. Add sans-serif fallbacks to floating surfaces.
- Reuse the shared Toast with an opt-in top-right viewport. Confirm accepted saves only; keep errors next to their recovery actions. The default viewport remains bottom-right.
- Keep the real dragged widget mounted, positioned from its measured pickup geometry and translated directly with the pointer. Lift it to 1.02 scale using the existing Settle token and fade its floating shadow using Respond.
- Reserve the prospective destination with a full-size outline and existing responsive size spans. Hover does not mutate the controlled layout. Drop commits the visible preview; cancellation preserves the original order.
- Capture the pointer on the stable editor, temporarily disable scroll anchoring and update hit testing on movement or actual scrolling. Preview reflow alone must not retarget a stationary pointer.
- Retain keyboard actions, focus restoration, Escape cancellation, touch input and edge scrolling. Resize cancels stale geometry. Reduced motion removes lift scaling while preserving direct movement and the destination outline.

## Verification

Local verification on 2026-11-23:

| Check | Result |
| --- | --- |
| `npm run check` | Passed: types, both CSS entries, declarations, 120 tests across 17 files, workshop build and public artifact checks |
| Packed consumer | Passed: isolated install, strict consumer types, 83 runtime exports, SSR/hydration and desktop/mobile interactions |
| Dashboard, overlays/pickers and navigation/feedback browser suites | 49 passed on desktop/mobile Edge; 1 existing desktop-only layout check skipped on mobile |
| HTTP integration browser suite | 8 passed: actual font loading, dialog typography, toast placement, remote state, compact drag footprint and reduced motion |
| Private website compatibility | Production build passed against the shared source |
| Visual inspection | Reviewed desktop/mobile live drag previews, compact drag feedback, dialog typography and save notification captures |

Regression work caught lost pointer capture during preview insertion and scroll anchoring/retargeting during reflow. The editor now captures on its stable root and commits the visible destination. Browser gestures also wait for preview reflow before measuring new targets; the touch test no longer moves to a header hidden behind sticky navigation after it already reached the target zone.

The existing Vite advisory for a production chunk above 500 kB remains. This phase adds no motion dependency and makes no new bundle-splitting claim.

## CI follow-up — 2026-11-23

The first full cloud run passed the HTTP integration job, package checks and 152 workshop scenarios, with three existing skips. One mobile reorder test issued a second pointer move after edge scrolling had already selected its intended destination. That unnecessary move could target the displaced card and select another slot. The test now retains an already-correct preview, or measures the current target before moving, and waits for the expected preview before releasing. Final order, reserved dimensions, persistence and Escape assertions remain enabled; component behavior is unchanged by this follow-up.

Both pointer scenarios passed three times on desktop and mobile with two concurrent browser workers (12 checks). TypeScript and diff checks passed. Full GitHub verification runs against the follow-up commit.

## Figma parity follow-up — 2026-11-23

Compared the affected Toast, Dialog, Card, Radio and Button families with the current Figma source before changing shared implementation. The new [Inline action Toast](https://www.figma.com/design/2jnGtX6x5wYdoJDum40ovM/Serenity-UI---Design-System?node-id=519-92) belongs to the existing Toast component set. Its Light/Dark desktop and mobile instances preserve bound variables and reuse the existing Secondary button and Solar Unread asset. No unrelated component families were restyled.

- Add `Toast.layout="inline"`: actions occupy the far-right column, message text fills the remaining width and grows vertically. The existing stacked CardFooter remains the default. The HTTP save confirmation and workshop specimen use the new variant.
- Restore the Toast's 12 px radius, muted description and 14 px action typography. A scoped typography selector prevents Button's default label utility from overriding the Figma token. The success asset uses semantic dark-mode ink.
- Center the standard Dialog header with its approved 12 px gap. Keep the featured header and native focus behavior unchanged.
- Replace example-only titles and feedback with semantic typography, Alert and Skeleton. Dashboard settings reuse IconButton for icon-only controls and theme-aware Solar artwork.
- Record the shared-component/Figma-parity rule in AGENTS.md and the application integration guide. Application CSS owns layout and font registration; the root rem scale remains intact.

Verification: `npm run check` passed (120 tests, types, library styles/declarations and workshop/public artifact checks); the final typography refinement also passed a library rebuild. Targeted dashboard, overlays, feedback and toast browser suites passed 53 checks with one existing desktop-only check skipped on mobile. Eight HTTP integration checks passed. Packed-consumer installation, typing, SSR/hydration and interactions passed; the private website production build passed.

Visually reviewed Figma's Light/Dark inline specimens and browser captures of the application, settings dialog and toast at desktop and mobile widths. The toast regression also covers a 320 px viewport, translated action text, dismissal and both themes. No horizontal overflow was observed in the application captures. This verification covers the affected families and examples, not a complete visual audit of every kit page.

## Boundaries

The local service remains an in-memory integration example. These changes add no production backend or authentication guarantees. A widget can remount when a completed drop moves it into a different zone; durable widget state should remain application-owned. Pointer tracking and grid reflow are immediate, with no eased pointer lag or animated layout dimensions. Mobile browser automation emulates touch; physical-device coverage remains future work.

The package stays at v0.2.0 until a separately authorized release. [Unreleased notes](../releases/unreleased.md) record the next delivery without rewriting the published v0.2.0 notes.
