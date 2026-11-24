# Phase 15 extension — File upload

Date: 2026-11-23

## Delivered scope

Complete File Upload before the documentation/adoption phase. `FileUpload` owns native picking, drag/drop, local selection limits and accessible rejection feedback. `FileUploadItem` renders application-controlled queued, uploading, successful, failed and cancelled entries. Optional callbacks provide Cancel, Retry and Remove using the existing secondary Button. Mobile action groups fill their row. Transport, queue ownership and persistence remain application concerns.

The approved Figma page `30 · File Upload` (`121:1292`) now includes queued, uploading, failed and cancelled file-row variants in source set `168:1426`, matching Light/Dark review instances and mobile usage. The responsive mobile source (`531:318`) places its secondary action below the file information at full width. Original linked Solar assets, semantic fills, typography, radius and spacing bindings are preserved. Text grows with content. The source set bounds now include its variants. The shared 50% Progress source uses equal fill/remaining track segments so it remains 50% at different instance widths.

The HTTP reference app validates CSV content up to 1 MiB, returns byte count and SHA-256 and does not retain file contents. The browser queue uses real transfer progress, cancellation and fresh-request retries; success requires an accepted response, not just 100% bytes sent. The workshop labels its timer-based demonstration as a simulation.

## Verification

See the consolidated [Phase 16 verification](./16-developer-documentation.md#verification) for the final checks covering this extension and its documentation. Dedicated tests cover file limits, native re-selection, disabled drop, controlled states, real service rejection, retry and cancellation, keyboard picking, Light/Dark and narrow layouts.

## Boundaries

No general storage service, authentication, resumable upload protocol, malware scanning or signed-URL provider is included. Client limits are usability checks, not server trust boundaries. Cancelling a request cannot guarantee a server-side rollback. Figma variants describe visual states; application callbacks own state transitions. No package release is created by this phase.
