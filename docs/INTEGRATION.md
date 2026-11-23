# Application integration

Serenity UI owns presentation, interaction and accessible component semantics. Your application owns network requests, identity, authorization, validation policies, caching and persistence. Components accept data and callbacks; they do not require a particular API or state-management library.

## Run the reference application

From the repository, using the supported Node version and locked dependencies:

```sh
npm ci
npm run example:integration
```

Open `http://127.0.0.1:5176`. The example imports the built package through its public exports. Vite proxies `/api/` requests to a Node HTTP service listening on a random loopback port. The workshop and private website remain separate. Override the example's frontend port with `SUI_INTEGRATION_PORT` if needed.

The source is in [examples/integration](../examples/integration/README.md). It demonstrates:

- Native form submission through Input, Select and Checkbox, with server field errors and focus recovery.
- Server filtering, sorting and pagination through DataTable.
- Request cancellation on replacement/unmount and protection against stale responses.
- Dashboard drafts saved over HTTP, retained across browser reloads, with optimistic version checks for conflicting writes.
- Loading, failure and retry states owned by the application.

The service is a development reference. Its memory resets when the process stops. It has no authentication, production authorization or durable database. Do not deploy it as a production backend. Cancellation stops client work; it does not guarantee rollback of a mutation already accepted by a server. Production mutations may require idempotency keys and transaction handling.

## Form contracts

| Control | Value contract | Focus target | Submission |
| --- | --- | --- | --- |
| Input, Textarea, PasswordInput | Native `value`/`defaultValue`, `onChange` | `ref` to the native input/textarea | Native `name` and `FormData` |
| Checkbox, Radio, Switch | Native `checked`/`defaultChecked`, `onChange` | `ref` to the native input | Checked enabled controls submit; unchecked controls are absent |
| Select | `value`/`defaultValue`, `onValueChange`; native `onChange` remains available | `ref` to the native select; `triggerProps.ref` to the visible button | Single value, or repeated entries for multiple selection |
| OTPInput | String `value`/`defaultValue`, `onValueChange` | `ref` to the native input | Preserves leading zeroes |
| DatePicker | ISO `YYYY-MM-DD` or `{ start, end }`, `onValueChange` | `triggerProps.ref` to the visible button | Single `name`; ranges use `${name}.start` and `${name}.end` |
| TimePicker | `HH:mm` string, `onValueChange` | `triggerProps.ref` to the visible button | Same value in 12-hour and 24-hour display modes |

Use controlled values when a form controller owns state. Use uncontrolled defaults with native `FormData` when the browser owns it. Do not switch between those modes during a control's lifetime. Controlled resets must update parent state; native resets restore uncontrolled defaults. Disabled controls do not submit. Preserve stable field names and row IDs.

```tsx
const acceptedRef = useRef<HTMLInputElement>(null);

<Checkbox
  ref={acceptedRef}
  name="updates"
  label="Receive updates"
  checked={updates}
  onChange={(event) => setUpdates(event.target.checked)}
/>
```

Checkbox's `indeterminate` visual state is separate from `checked`; only `checked` determines form submission. Both object and callback refs are supported, including React 19 cleanup callbacks.

Picker changes are staged until Apply. To integrate focus or a form controller's touched state:

```tsx
<DatePicker
  label="Start date"
  name="startDate"
  value={startDate}
  onValueChange={setStartDate}
  error={errors.startDate}
  triggerProps={{ ref: startDateRef, onBlur: () => markTouched("startDate") }}
/>
```

`triggerProps.onBlur` is a button blur event, including focus moving into the picker. It is not a whole-popup dismissal event. If validation should begin only after a selection is committed, mark the field touched in `onValueChange`. Keep application-owned error text connected through `error` or native `aria-describedby` for controls without a field wrapper.

## Server validation

Browser validation improves feedback; validate again on the server. The reference API returns `422` with a general message and a map of field errors. The example passes field messages into `error`, announces the general result in a live status region and focuses the first invalid field through its public ref. It does not insert server text as HTML.

```json
{
  "message": "Review the highlighted fields.",
  "fields": { "name": "This workspace already exists." }
}
```

`requestJson` validates successful responses before they enter component state. It distinguishes HTTP errors, malformed successful payloads and transport failures. Production applications should adapt this contract to their own schemas and error codes.

## Remote tables

DataTable renders the supplied page. It does not fetch or sort records itself. Connect `onSortChange` and `pagination.onPageChange` to query state, then provide the resulting `rows`, `sort`, `loading`, `error` and total count. Reset the page when a filter or sort changes. A loading or error state must not expose stale rows as a successful result.

The example's resource hook aborts previous reads and checks request identity before displaying results. Every accepted response is validated. Selection uses stable IDs; cross-page retention and bulk-operation authorization remain application policy. For empty results, supply an application-specific `emptyState` or use the built-in subtle state.

## Dashboard persistence

`DashboardEditor` edits a controlled draft through `value` and `onChange`. Save and cancel belong to the application. The example sends `{ version, items }` to its service; a successful save increments the version. A stale write returns `409`, preserves the local draft and offers an explicit reload. Reload intentionally discards the draft. A production service must also enforce ownership and allowed widgets, zones and sizes for the authenticated user.

## Authentication compositions

Auth components are UI, not an authentication service. Their callbacks receive an `AbortSignal` and may return a promise. Use the signal in your API client and reject on failure; do not resolve a failed HTTP response as a successful sign-in.

```tsx
<SignInForm
  onSignIn={async (values, { signal }) => {
    const response = await fetch("/api/session", {
      method: "POST",
      signal,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!response.ok) throw new Error("Sign-in failed.");
    navigate("/workspace");
  }}
/>
```

The application handles sessions, redirects, recovery tokens, authorization and safe error mapping. Do not store passwords or session secrets in design tokens, component props persisted to storage, or the public workshop. The reference application's CRUD service does not implement `/api/session`.

## Styling and server rendering

See [installation](./INSTALLATION.md) for `styles.css`, the optional `styles-no-preflight.css` entry, React peers and server/client boundaries. No-Preflight means no global Tailwind element reset; it does not namespace utility classes or isolate the stylesheet in a shadow root. Your application must supply a compatible base reset for component geometry, borders and native controls.

The packed consumer verifies representative server rendering and browser hydration. It is not certification of every framework, every component or React Server Components. Framework-specific routing, streaming, font loading and serialized initial data remain application integration work.

## Verification

```sh
npm run check
npm run check:package
npm run test:integration
```

The integration suite uses a real local HTTP service. Browser failure/stale-response cases additionally intercept selected requests to reproduce network conditions deterministically. No production credentials or external services are used. GitHub Actions runs the integration suite on desktop and mobile Chromium separately from the existing workshop regression suite.

References: [React refs and cleanup](https://react.dev/reference/react-dom/components/common#ref-callback), [React hydration](https://react.dev/reference/react-dom/client/hydrateRoot), [Tailwind Preflight](https://tailwindcss.com/docs/preflight).
