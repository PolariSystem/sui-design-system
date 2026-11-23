import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { randomUUID } from "node:crypto";
import {
  isLayout,
  isObject,
  type FieldErrors,
  type LayoutSnapshot,
  type RecordItem,
} from "./contracts.ts";

class HttpError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function readJson(request: IncomingMessage): Promise<unknown> {
  if (!request.headers["content-type"]?.startsWith("application/json"))
    throw new HttpError(415, "Send application/json.");
  const chunks: Buffer[] = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > 16_384) throw new HttpError(413, "Request body is too large.");
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new HttpError(400, "Invalid JSON.");
  }
}
function json(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(body));
}

/** Loopback-only reference service. State is isolated per server and resets on restart. */
export function createIntegrationServer() {
  const records: RecordItem[] = Array.from({ length: 12 }, (_, index) => ({
    id: `record-${index + 1}`,
    name: `Workspace ${String(index + 1).padStart(2, "0")}`,
    role: index % 2 ? "editor" : "viewer",
    updates: false,
  }));
  let layout: LayoutSnapshot = {
    version: 1,
    items: [
      { id: "activity", zone: "analysis", size: "M" },
      { id: "health", zone: "summary", size: "M" },
    ],
  };
  return createServer(async (request, response) => {
    try {
      // Browsers use the Vite same-origin proxy. Do not enable arbitrary cross-origin writes.
      if (
        request.headers.origin &&
        request.headers.origin !== `http://${request.headers.host}`
      )
        throw new HttpError(403, "Origin is not allowed.");
      const url = new URL(request.url ?? "/", "http://localhost");
      if (url.pathname === "/api/records" && request.method === "GET") {
        const page = Number(url.searchParams.get("page") ?? 1);
        const size = Number(url.searchParams.get("pageSize") ?? 4);
        const direction = url.searchParams.get("direction") ?? "ascending";
        const query = (url.searchParams.get("query") ?? "")
          .trim()
          .toLowerCase();
        if (
          !Number.isSafeInteger(page) ||
          page < 1 ||
          !Number.isSafeInteger(size) ||
          size < 1 ||
          size > 100 ||
          query.length > 100 ||
          !["ascending", "descending"].includes(direction)
        )
          throw new HttpError(400, "Invalid page, query or sort parameters.");
        const filtered = records
          .filter((record) => record.name.toLowerCase().includes(query))
          .sort(
            (a, b) =>
              (a.name.localeCompare(b.name, "en") || a.id.localeCompare(b.id)) *
              (direction === "ascending" ? 1 : -1),
          );
        return json(response, 200, {
          items: filtered.slice((page - 1) * size, page * size),
          total: filtered.length,
        });
      }
      if (url.pathname === "/api/records" && request.method === "POST") {
        const body = await readJson(request);
        if (!isObject(body)) throw new HttpError(400, "Expected an object.");
        const errors: FieldErrors = {};
        const name = typeof body.name === "string" ? body.name.trim() : "";
        if (name.length < 3 || name.length > 80)
          errors.name = "Use between 3 and 80 characters.";
        else if (
          records.some(
            (record) => record.name.toLowerCase() === name.toLowerCase(),
          )
        )
          errors.name = "This workspace already exists.";
        if (body.role !== "viewer" && body.role !== "editor")
          errors.role = "Choose an available role.";
        if (typeof body.updates !== "boolean")
          errors.updates = "Choose whether to receive updates.";
        if (Object.keys(errors).length)
          return json(response, 422, {
            message: "Review the highlighted fields.",
            fields: errors,
          });
        if (records.length >= 1_000)
          throw new HttpError(409, "The demo record limit has been reached.");
        const record: RecordItem = {
          id: randomUUID(),
          name,
          role: body.role as RecordItem["role"],
          updates: body.updates as boolean,
        };
        records.push(record);
        return json(response, 201, record);
      }
      if (url.pathname === "/api/dashboard" && request.method === "GET")
        return json(response, 200, layout);
      if (url.pathname === "/api/dashboard" && request.method === "PUT") {
        const next = await readJson(request);
        if (!isLayout(next))
          throw new HttpError(422, "Invalid dashboard layout.");
        // Compare and update synchronously after parsing; stale clients must reload before saving.
        if (next.version !== layout.version)
          throw new HttpError(
            409,
            "The dashboard changed elsewhere. Reload before saving.",
          );
        layout = { version: layout.version + 1, items: next.items };
        return json(response, 200, layout);
      }
      throw new HttpError(404, "Endpoint not found.");
    } catch (error) {
      if (!response.destroyed)
        json(response, error instanceof HttpError ? error.status : 500, {
          message:
            error instanceof HttpError
              ? error.message
              : "The service could not complete the request.",
        });
    }
  });
}
