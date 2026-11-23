import { isObject, type FieldErrors } from "./contracts";

export class ApiError extends Error {
  readonly status: number;
  readonly fields: FieldErrors;
  constructor(status: number, message: string, fields: FieldErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

/** Validate untrusted HTTP payloads at the application boundary, not inside UI components. */
export async function requestJson<T>(
  path: string,
  decode: (value: unknown) => value is T,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body !== undefined)
    headers.set("Content-Type", "application/json");
  const response = await fetch(path, { ...init, headers });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const fields: FieldErrors = {};
    if (isObject(body) && isObject(body.fields))
      for (const key of ["name", "role", "updates"] as const)
        if (typeof body.fields[key] === "string")
          fields[key] = body.fields[key];
    throw new ApiError(
      response.status,
      isObject(body) && typeof body.message === "string"
        ? body.message
        : "The service is unavailable. Try again.",
      fields,
    );
  }
  if (!decode(body))
    throw new ApiError(502, "The service returned an unexpected response.");
  return body;
}
export const errorMessage = (error: unknown) =>
  error instanceof ApiError
    ? error.message
    : "Could not reach the service. Try again.";
