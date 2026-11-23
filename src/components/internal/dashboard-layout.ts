import type {
  DashboardItem,
  DashboardLayout,
  DashboardSize,
  DashboardWidgetDefinition,
  DashboardZone,
} from "../Dashboard.types";

export const dashboardZones = ["summary", "analysis", "hidden"] as const;
export const dashboardZoneNames = {
  summary: "Summary",
  analysis: "Analysis",
  hidden: "Hidden",
};
const sizes: readonly DashboardSize[] = ["S", "M", "L"];

function validateDefinitions(widgets: readonly DashboardWidgetDefinition[]) {
  const ids = new Set<string>();
  for (const widget of widgets) {
    if (
      !widget.id.trim() ||
      ids.has(widget.id) ||
      !widget.title.trim() ||
      !["summary", "analysis"].includes(widget.defaultZone) ||
      !widget.sizes.length ||
      widget.sizes.some((size) => !sizes.includes(size)) ||
      new Set(widget.sizes).size !== widget.sizes.length ||
      !widget.sizes.includes(widget.defaultSize)
    ) {
      throw new Error(
        "Dashboard widgets require unique IDs, a title, valid sizes and a visible default zone.",
      );
    }
    ids.add(widget.id);
  }
}

/** Reject programming errors; use restoreDashboardLayout for untrusted persisted data. */
export function validateDashboardLayout(
  widgets: readonly DashboardWidgetDefinition[],
  value: DashboardLayout,
) {
  validateDefinitions(widgets);
  const seen = new Set<string>();
  if (value.length !== widgets.length)
    throw new Error("Dashboard layout must contain each widget exactly once.");
  for (const item of value) {
    const widget = widgets.find((widget) => widget.id === item.id);
    if (
      !widget ||
      seen.has(item.id) ||
      !dashboardZones.includes(item.zone) ||
      !widget.sizes.includes(item.size)
    ) {
      throw new Error(
        "Dashboard layout contains an unknown, duplicate or invalid entry.",
      );
    }
    seen.add(item.id);
  }
}

/** Move before a target or append to a zone. Other widgets retain their relative order. */
export function moveDashboardItem(
  value: DashboardLayout,
  id: string,
  zone: DashboardZone,
  beforeId?: string,
): DashboardItem[] {
  const item = value.find((item) => item.id === id);
  if (!item || beforeId === id || !dashboardZones.includes(zone))
    return [...value];
  const rest = value.filter((item) => item.id !== id);
  const before = rest.findIndex(
    (item) => item.id === beforeId && item.zone === zone,
  );
  const last = rest.reduce(
    (index, entry, current) => (entry.zone === zone ? current : index),
    -1,
  );
  rest.splice(before >= 0 ? before : last >= 0 ? last + 1 : rest.length, 0, {
    ...item,
    zone,
  });
  return rest;
}

/** Versioned, metadata-only persistence. Never serialize widget content or business data. */
export function serializeDashboardLayout(value: DashboardLayout): string {
  return JSON.stringify({
    version: 1,
    items: value.map(({ id, zone, size }) => ({ id, zone, size })),
  });
}

/** Reconcile old catalogs safely: discard removed/duplicate entries and append newly available widgets. */
export function restoreDashboardLayout(
  serialized: string | null,
  widgets: readonly DashboardWidgetDefinition[],
  defaults: DashboardLayout,
): DashboardItem[] {
  validateDashboardLayout(widgets, defaults);
  let parsed: unknown;
  try {
    parsed = serialized ? JSON.parse(serialized) : null;
  } catch {
    parsed = null;
  }
  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("version" in parsed) ||
    parsed.version !== 1 ||
    !("items" in parsed) ||
    !Array.isArray(parsed.items)
  )
    return defaults.map((item) => ({ ...item }));
  const result: DashboardItem[] = [];
  const seen = new Set<string>();
  for (const candidate of parsed.items as unknown[]) {
    if (
      !candidate ||
      typeof candidate !== "object" ||
      !("id" in candidate) ||
      typeof candidate.id !== "string" ||
      seen.has(candidate.id)
    )
      continue;
    const widget = widgets.find((widget) => widget.id === candidate.id);
    const fallback = defaults.find((item) => item.id === candidate.id);
    if (!widget || !fallback) continue;
    seen.add(widget.id);
    const zone =
      "zone" in candidate &&
      dashboardZones.includes(candidate.zone as DashboardZone)
        ? (candidate.zone as DashboardZone)
        : fallback.zone;
    const size =
      "size" in candidate &&
      widget.sizes.includes(candidate.size as DashboardSize)
        ? (candidate.size as DashboardSize)
        : fallback.size;
    result.push({ id: widget.id, zone, size });
  }
  return [
    ...result,
    ...defaults
      .filter((item) => !seen.has(item.id))
      .map((item) => ({ ...item })),
  ];
}
