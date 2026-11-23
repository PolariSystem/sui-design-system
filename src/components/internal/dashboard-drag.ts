import type { CSSProperties } from "react";

export interface DashboardDragGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Keep the original widget mounted and pointer-captured while a destination slot takes its place. */
export function dragSlotStyle(
  geometry?: DashboardDragGeometry,
): CSSProperties | undefined {
  return geometry
    ? {
        position: "absolute",
        left: geometry.x,
        top: geometry.y,
        width: geometry.width,
        height: geometry.height,
        zIndex: 40,
      }
    : undefined;
}
