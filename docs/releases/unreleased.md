# Unreleased

Follow-up to v0.2.0. These changes do not create a package or registry release.

## Fixed

- The HTTP reference app now loads DM Sans and scopes host heading styles. Dialog typography no longer inherits unrelated application heading sizes.
- Floating surfaces include a sans-serif fallback when the theme font is unavailable.
- Successful dashboard saves use the shared top-right toast; failed writes retain inline recovery feedback.
- Figma parity: Toast uses the 12 px radius and muted description token; the standard Dialog header centers its title and close control with a 12 px gap.
- The HTTP example uses shared Alerts, Skeleton, heading tokens and IconButton settings rather than example-specific visual substitutes.

## Added

- FileUpload and FileUploadItem with native picking/drop, selection constraints, accessible feedback and controlled queue states. Figma source variants and Light/Dark mobile examples are aligned with the implementation.
- A real HTTP upload reference with byte progress, cancellation, retry and server-side CSV validation; no file storage is included.
- Ten navigable developer guides, compiled form/upload recipes, generated API declarations for public modules and a CI check against stale reference output. See [Phase 16](../phases/16-developer-documentation.md) and the [adoption guide](../ADOPTION.md).

- `ToastViewport.position`: `"top-right"` or `"bottom-right"`. The existing bottom-right default and inline previews remain compatible.
- `Toast.layout="inline"` keeps the action at the far right on desktop and mobile, beside wrapping message content. The default `"stacked"` footer remains available. Matching token-bound Figma variants and workshop specimens cover Light/Dark modes.
- Dashboard drag feedback for compact and live editors: held-card elevation, a full-size destination outline, stable pointer capture and preview-first commits. Pointer/touch input, edge scrolling, keyboard controls and reduced motion remain supported.
- Browser regression coverage for typography, notification placement, drag footprint, cancellation and widget state preservation.

See [Phase 15](../phases/15-integration-interaction-polish.md) for verification and boundaries.
