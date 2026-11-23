import { AssetIcon } from "./AssetIcon";
import { dragSlotStyle, type DashboardDragGeometry } from "./dashboard-drag";
import type { ComponentPropsWithRef, ReactNode } from "react";
import type {
  DashboardItem,
  DashboardWidgetDefinition,
  DashboardSize,
  DashboardZone,
} from "../Dashboard.types";
import { Button } from "../Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../DropdownMenu";
import { DashboardWidgetSettings } from "./DashboardWidgetSettings";
import { dashboardZones, dashboardZoneNames } from "./dashboard-layout";
import dragIcon from "../../assets/dashboard-drag.svg";
import moreIcon from "../../assets/widget-more.svg";

interface DashboardLiveCardProps {
  widget: DashboardWidgetDefinition;
  item: DashboardItem;
  index: number;
  count: number;
  dragging: boolean;
  offset: { x: number; y: number };
  geometry?: DashboardDragGeometry;
  handleProps: ComponentPropsWithRef<"button">;
  onSizeChange: (size: DashboardSize) => void;
  onMove: (zone: DashboardZone) => void;
  onReorder: (direction: -1 | 1) => void;
  onCloseMenu: (event: Event) => void;
  children: ReactNode;
}
const sizeNames = { S: "Small", M: "Medium", L: "Large" };

/** Keep one real widget mounted while dragging, preserving chart state and pointer capture. */
export function DashboardLiveCard({
  widget,
  item,
  index,
  count,
  dragging,
  offset,
  geometry,
  handleProps,
  onSizeChange,
  onMove,
  onReorder,
  onCloseMenu,
  children,
}: DashboardLiveCardProps) {
  return (
    <div
      role="group"
      aria-label={widget.title}
      className="sui-dashboard-slot sui-dashboard-edit-slot"
      data-size={item.size}
      data-editor-card={item.id}
      data-dragging={dragging || undefined}
      style={dragSlotStyle(dragging ? geometry : undefined)}
    >
      <div
        className="sui-dashboard-live-card"
        style={
          dragging
            ? { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }
            : undefined
        }
      >
        <div className="sui-dashboard-edit-toolbar">
          <button
            {...handleProps}
            type="button"
            className="sui-dashboard-drag sui-dashboard-live-handle"
            aria-label={`Drag ${widget.title}`}
          >
            <AssetIcon src={dragIcon} size={16} />
            <span>Drag to move</span>
          </button>
          <span
            className="sui-dashboard-chip"
            data-size-chip
            aria-label={`${sizeNames[item.size]} widget`}
          >
            {item.size}
          </span>
          <DashboardWidgetSettings
            compact
            title={widget.title}
            size={item.size}
            sizes={widget.sizes}
            onSizeChange={onSizeChange}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                iconOnly
                variant="tertiary"
                aria-label={`Widget actions for ${widget.title}`}
              >
                <img src={moreIcon} alt="" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent onCloseAutoFocus={onCloseMenu}>
              <DropdownMenuItem
                disabled={index === 0}
                onSelect={() => onReorder(-1)}
              >
                Move earlier
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={index === count - 1}
                onSelect={() => onReorder(1)}
              >
                Move later
              </DropdownMenuItem>
              {dashboardZones
                .filter((zone) => zone !== item.zone)
                .map((zone) => (
                  <DropdownMenuItem key={zone} onSelect={() => onMove(zone)}>
                    {zone === "hidden"
                      ? "Hide widget"
                      : `Move to ${dashboardZoneNames[zone]}`}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="sui-dashboard-live-content">{children}</div>
      </div>
    </div>
  );
}
