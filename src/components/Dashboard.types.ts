import type { ReactNode } from "react";

export type DashboardZone = "summary" | "analysis" | "hidden";
export type DashboardSize = "S" | "M" | "L";
export interface DashboardItem {
  id: string;
  zone: DashboardZone;
  size: DashboardSize;
}
/** Array order is reading order within each zone. IDs must be stable across sessions. */
export type DashboardLayout = readonly DashboardItem[];
export interface DashboardWidgetDefinition {
  id: string;
  title: string;
  kind: string;
  defaultZone: Exclude<DashboardZone, "hidden">;
  defaultSize: DashboardSize;
  /** Restrict sizes when a visualization cannot remain readable in a small card. */
  sizes: readonly DashboardSize[];
}
export interface DashboardProps {
  widgets: readonly DashboardWidgetDefinition[];
  value: DashboardLayout;
  renderWidget: (
    widget: DashboardWidgetDefinition,
    item: DashboardItem,
  ) => ReactNode;
  /** Records or other fixed content remain outside customizable zones. */
  children?: ReactNode;
  className?: string;
}
export interface DashboardEditorProps {
  widgets: readonly DashboardWidgetDefinition[];
  value: DashboardLayout;
  /** Updates a draft. Saving, cancellation and persistence belong to the consumer. */
  onChange: (layout: DashboardItem[]) => void;
  /** Render actual widgets in their responsive grid. Omit for the compact zone-management view.
   * Hidden widgets are restored through the consumer's catalog in this mode. */
  renderWidget?: DashboardProps["renderWidget"];
  className?: string;
}
