# File upload

Use FileUpload to select files and FileUploadItem to render an application-owned queue. Both use the approved Solar artwork, semantic colors, growing text and responsive actions. Selection supports keyboard browsing and drag/drop; dragging is never the only input method.

## Select files

```tsx
<FileUpload
  label="Choose attachments"
  accept=".csv,.pdf,image/*"
  multiple
  maxSize={10 * 1024 * 1024}
  maxFiles={5}
  helperText="CSV, PDF or images · Up to 10 MiB each"
  onFilesSelect={(files) => addToQueue(files)}
  onReject={(rejections) => recordRejectedFiles(rejections)}
/>
```

Defaults: single selection; no type/size limit; multiple mode has no count limit unless maxFiles is supplied. Limits apply to each selection. Pass remaining capacity and disable the picker when an application-owned queue is full. Accepted files and typed rejections are reported separately. Type checks support extensions, exact MIME types and MIME wildcards; filename matching is case-insensitive. A browser may omit MIME information, so include extensions when appropriate. Localize rejection text with rejectionMessage.

The native picker clears after each selection to permit selecting the same file again. This is a callback-based selector, not a form field: retain File objects in application state and append them to FormData yourself. inputRef exposes the native picker; triggerProps exposes its visible button, including ref and blur/click events. Use the visible trigger for field focus. Native form reset does not clear an application-owned queue.

## Transfer state

```tsx
<FileUploadItem
  name={entry.file.name}
  detail={formatBytes(entry.file.size)}
  status={entry.status}
  progress={entry.progress}
  error={entry.error}
  onCancel={() => cancel(entry.id)}
  onRetry={() => retry(entry.id)}
  onRemove={() => remove(entry.id)}
/>
```

States are queued, uploading, success, error and cancelled. Omit progress for indeterminate transfers; numeric progress is clamped by Progress to 0–100. Reaching 100% means bytes were transmitted, not that the server accepted or processed the file. Set success only after a successful validated response. Progress exposes accessible numeric values; concise status changes are announced without announcing every progress event. Actions are omitted unless a corresponding callback is provided. Labels and status text are localizable.

Cancel aborts application transport; Retry starts a new attempt. Ignore callbacks from superseded attempts. Removing a file from the queue does not delete a server object; implement that separately when needed. After removing a focused row, return focus to the next action or the visible picker. Actions stack inside narrow containers, not only on narrow viewports.

## Run the HTTP example

```sh
npm run example:integration
```

The Upload attachments example accepts up to five CSV files, each no larger than 1 MiB. upload.ts uses XMLHttpRequest for request-body progress and AbortSignal for cancellation. The local service checks the byte limit, filename, UTF-8 decoding and basic comma-separated content, then returns a receipt and SHA-256 digest. It does not retain file contents, import records or provide durable storage.

For multipart endpoints, create FormData and let the browser set its Content-Type boundary. For signed storage URLs, keep signing credentials on your server and use the returned scoped URL in the application transport. The UI does not require either transport. Cancellation cannot undo a request already accepted by a server.

Client filters improve feedback; they are not a security boundary. Production services own authorization, quotas, content validation, scanning, safe storage names and retention. The example's basic CSV checks are not a general content scanner.

Browser references: [file input and accept](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/file), [XMLHttpRequest upload progress](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/upload).
