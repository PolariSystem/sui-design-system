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

`npm run test:integration` starts its own server on port 5176; stop the manual example before running it. See [application integration](../../docs/INTEGRATION.md) for public component contracts and application responsibilities.
