// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createIntegrationServer } from "../examples/integration/server";
import { requestJson, ApiError } from "../examples/integration/api";
import {
  isLayout,
  isRecord,
  isRecordsPage,
} from "../examples/integration/contracts";

describe("reference HTTP integration", () => {
  const server = createIntegrationServer();
  let origin: string;
  beforeAll(async () => {
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Expected an HTTP port.");
    origin = `http://127.0.0.1:${address.port}`;
  });
  afterAll(async () => {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("returns server pages and deterministic sort/filter results", async () => {
    const page = await requestJson(
      `${origin}/api/records?page=2&pageSize=4&direction=descending`,
      isRecordsPage,
    );
    expect(page.total).toBe(12);
    expect(page.items.map((record) => record.name)).toEqual([
      "Workspace 08",
      "Workspace 07",
      "Workspace 06",
      "Workspace 05",
    ]);
    const filtered = await requestJson(
      `${origin}/api/records?query=12`,
      isRecordsPage,
    );
    expect(filtered.total).toBe(1);
    expect(filtered.items[0].name).toBe("Workspace 12");
    await expect(
      requestJson(`${origin}/api/records?page=-1`, isRecordsPage),
    ).rejects.toMatchObject({ status: 400 });
  });
  it("reports field errors, accepts a valid mutation and rejects duplicates", async () => {
    const post = (name: string) =>
      requestJson(`${origin}/api/records`, isRecord, {
        method: "POST",
        body: JSON.stringify({ name, role: "editor", updates: true }),
      });
    await expect(post("x")).rejects.toMatchObject({
      status: 422,
      fields: { name: "Use between 3 and 80 characters." },
    });
    expect((await post("Integration team")).name).toBe("Integration team");
    await expect(post("Integration team")).rejects.toMatchObject({
      status: 422,
    });
  });
  it("persists layout updates and rejects stale or malformed writes", async () => {
    const previous = await requestJson(`${origin}/api/dashboard`, isLayout);
    const changed = {
      ...previous,
      items: previous.items.map((item) => ({ ...item, size: "L" as const })),
    };
    const write = (value: unknown) =>
      requestJson(`${origin}/api/dashboard`, isLayout, {
        method: "PUT",
        body: JSON.stringify(value),
      });
    const saved = await write(changed);
    expect(saved.version).toBe(previous.version + 1);
    expect(await requestJson(`${origin}/api/dashboard`, isLayout)).toEqual(
      saved,
    );
    await expect(write(changed)).rejects.toMatchObject({ status: 409 });
    await expect(
      write({ version: saved.version, items: [] }),
    ).rejects.toMatchObject({ status: 422 });
  });
  it("supports cancellation and rejects unexpected successful payloads", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      requestJson(`${origin}/api/records`, isRecordsPage, {
        signal: controller.signal,
      }),
    ).rejects.toMatchObject({ name: "AbortError" });
    await expect(
      requestJson(`${origin}/api/records`, isLayout),
    ).rejects.toBeInstanceOf(ApiError);
  });
  it("rejects malformed JSON and cross-origin writes without exposing internal errors", async () => {
    const malformed = await fetch(`${origin}/api/records`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    expect(malformed.status).toBe(400);
    const foreign = await fetch(`${origin}/api/dashboard`, {
      method: "PUT",
      headers: { Origin: "https://untrusted.example" },
    });
    expect(foreign.status).toBe(403);
  });
});
