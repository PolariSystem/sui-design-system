# HTTP integration reference

Run `npm run example:integration` from the repository root, then open `http://127.0.0.1:5176`. Stop with Ctrl+C. Requires the repository's supported Node version and `npm ci` first. No additional dependencies, accounts or environment secrets are required.

This example consumes the built public package. Its service uses in-memory data and binds to loopback. Browser reloads retain saved state; restarting the service resets it. Do not deploy the service as production infrastructure.

| File | Responsibility |
| --- | --- |
| `contracts.ts` | Application data types and response/layout validation |
| `server.ts` | Real HTTP routes, field validation, bounded input and versioned writes |
| `api.ts` | Fetch boundary and typed errors |
| `useRemoteResource.ts` | Cancellation, stale-result protection and request states |
| `RecordForm.tsx` | Native forms, server errors and focus recovery |
| `RemoteRecords.tsx` | Server pagination, filtering and sorting |
| `PersistedDashboard.tsx` | Draft editing, save, conflict handling and explicit reload |
| `dev.mjs` | Same-origin Vite proxy and service lifecycle |

The example loads DM Sans and scopes host heading styles so dialog portals retain the kit's typography. Successful dashboard saves use the shared toast at the top-right; errors stay beside the draft. Dragging lifts the existing card and previews the destination footprint before committing a move.

`npm run test:integration` starts its own server on port 5176; stop the manual example before running it, or set `SUI_INTEGRATION_PORT` to another free port (for example, 5178). The same variable configures the manual example. See [application integration](../../docs/INTEGRATION.md) for public component contracts and application responsibilities.
