/** Application contracts belong to this example, not to the design-system package. */
export interface RecordItem {
  id: string;
  name: string;
  role: "viewer" | "editor";
  updates: boolean;
}
export interface RecordsPage {
  items: RecordItem[];
  total: number;
}
export interface LayoutItem {
  id: "activity" | "health";
  zone: "summary" | "analysis" | "hidden";
  size: "M" | "L";
}
export interface LayoutSnapshot {
  version: number;
  items: LayoutItem[];
}
export type FieldErrors = Partial<Record<"name" | "role" | "updates", string>>;
export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function isRecord(value: unknown): value is RecordItem {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    (value.role === "viewer" || value.role === "editor") &&
    typeof value.updates === "boolean"
  );
}
export function isRecordsPage(value: unknown): value is RecordsPage {
  return (
    isObject(value) &&
    Array.isArray(value.items) &&
    value.items.every(isRecord) &&
    Number.isSafeInteger(value.total) &&
    Number(value.total) >= 0
  );
}
export function isLayout(value: unknown): value is LayoutSnapshot {
  if (
    !isObject(value) ||
    !Number.isSafeInteger(value.version) ||
    Number(value.version) < 1 ||
    !Array.isArray(value.items) ||
    value.items.length !== 2
  )
    return false;
  const ids = new Set<string>();
  for (const item of value.items) {
    if (
      !isObject(item) ||
      (item.id !== "activity" && item.id !== "health") ||
      (item.zone !== "summary" &&
        item.zone !== "analysis" &&
        item.zone !== "hidden") ||
      (item.size !== "M" && item.size !== "L")
    )
      return false;
    ids.add(item.id);
  }
  return ids.size === 2;
}
