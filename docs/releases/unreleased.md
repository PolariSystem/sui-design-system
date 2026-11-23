# Unreleased

Follow-up to v0.2.0. These changes do not create a package or registry release.

## Fixed

- The HTTP reference app now loads DM Sans and scopes host heading styles. Dialog typography no longer inherits unrelated application heading sizes.
- Floating surfaces include a sans-serif fallback when the theme font is unavailable.
- Successful dashboard saves use the shared top-right toast; failed writes retain inline recovery feedback.

## Added

- `ToastViewport.position`: `"top-right"` or `"bottom-right"`. The existing bottom-right default and inline previews remain compatible.
- Dashboard drag feedback for compact and live editors: held-card elevation, a full-size destination outline, stable pointer capture and preview-first commits. Pointer/touch input, edge scrolling, keyboard controls and reduced motion remain supported.
- Browser regression coverage for typography, notification placement, drag footprint, cancellation and widget state preservation.

See [Phase 15](../phases/15-integration-interaction-polish.md) for verification and boundaries.
