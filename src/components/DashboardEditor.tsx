import { AssetIcon } from "./internal/AssetIcon";
import {
  useId,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import type {
  DashboardEditorProps,
  DashboardItem,
  DashboardZone,
} from "./Dashboard.types";
import {
  dashboardZoneNames,
  dashboardZones,
  moveDashboardItem,
  validateDashboardLayout,
} from "./internal/dashboard-layout";
import { Button } from "./Button";
import { Card, CardFooter } from "./Card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./DropdownMenu";
import dragIcon from "../assets/dashboard-drag.svg";
import chevronIcon from "../assets/dashboard-chevron.svg";
import showIcon from "../assets/dashboard-show.svg";

import { DashboardLiveCard } from "./internal/DashboardLiveCard";
import {
  dragSlotStyle,
  type DashboardDragGeometry,
} from "./internal/dashboard-drag";
import { DashboardWidgetSettings } from "./internal/DashboardWidgetSettings";

const descriptions = {
  summary: "Headline metrics · Compact cards",
  analysis: "Charts and comparisons · M or L",
  hidden: "Saved for later · Not on dashboard",
};
const sizeNames = { S: "Small", M: "Medium", L: "Large" };
interface DropTarget {
  zone: DashboardZone;
  beforeId?: string;
}
interface DragSession {
  id: string;
  pointerId: number;
  x: number;
  y: number;
  started: boolean;
  scrollY: number;
  lastScrollY: number;
  overflowAnchor: string;
  scrollContainer: HTMLElement;
  geometry: DashboardDragGeometry;
  destination: DropTarget | null;
}

/** Dragging works inside application panels as well as a full document. */
function findScrollContainer(node: HTMLElement): HTMLElement {
  for (let parent = node.parentElement; parent; parent = parent.parentElement) {
    if (
      /(auto|scroll)/.test(getComputedStyle(parent).overflowY) &&
      parent.scrollHeight > parent.clientHeight
    )
      return parent;
  }
  return document.scrollingElement as HTMLElement;
}

/** Controlled draft editor. Pointer handles and explicit controls use the same move operation. */
export function DashboardEditor({
  widgets,
  value,
  onChange,
  renderWidget,
  className = "",
}: DashboardEditorProps) {
  validateDashboardLayout(widgets, value);
  const root = useRef<HTMLDivElement>(null);
  const handles = useRef(new Map<string, HTMLButtonElement>());
  const pendingFocus = useRef<string | null>(null);
  const menuFocus = useRef<string | null>(null);
  const drag = useRef<DragSession | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [target, setTarget] = useState<DropTarget | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [geometry, setGeometry] = useState<DashboardDragGeometry>();
  const pointer = useRef({ x: 0, y: 0 });
  const [announcement, setAnnouncement] = useState("");
  const instructions = useId();

  useEffect(
    () => () => {
      const session = drag.current;
      if (session)
        session.scrollContainer.style.overflowAnchor = session.overflowAnchor;
    },
    [],
  );

  // Moving across zones remounts a card. Restore focus to its new handle, never the document body.
  useLayoutEffect(() => {
    if (pendingFocus.current) {
      (handles.current.get(pendingFocus.current) ?? root.current)?.focus();
      pendingFocus.current = null;
    }
  }, [value, dragging]);

  // Preview the destination in layout without committing model changes. The original
  // widget stays mounted out of flow; edge scrolling continues while the pointer is held.
  useEffect(() => {
    if (!dragging) return;
    let frame: number;
    function update() {
      const session = drag.current;
      if (!session) return;
      const { x, y } = pointer.current;
      const container = session.scrollContainer;
      const bounds =
        container === document.scrollingElement
          ? { top: 0, bottom: window.innerHeight }
          : container.getBoundingClientRect();
      const scroll =
        y < Math.max(0, bounds.top) + 64
          ? -12
          : y > Math.min(window.innerHeight, bounds.bottom) - 64
            ? 12
            : 0;
      if (scroll) container.scrollBy({ top: scroll, behavior: "instant" });
      const nextOffset = {
        x: x - session.x,
        y: y - session.y + container.scrollTop - session.scrollY,
      };
      setOffset((current) =>
        current.x === nextOffset.x && current.y === nextOffset.y
          ? current
          : nextOffset,
      );
      // Reflow alone is not a new drag intention. Retest only after actual scrolling;
      // otherwise a stationary pointer can make the placeholder oscillate between slots.
      if (container.scrollTop !== session.lastScrollY) {
        session.lastScrollY = container.scrollTop;
        const nextTarget = dropTarget(x, y);
        session.destination = nextTarget;
        setTarget((current) =>
          current?.zone === nextTarget?.zone &&
          current?.beforeId === nextTarget?.beforeId
            ? current
            : nextTarget,
        );
      }
      frame = requestAnimationFrame(update);
    }
    function cancel() {
      clearDrag();
      setAnnouncement("Move cancelled. Layout unchanged.");
    }
    frame = requestAnimationFrame(update);
    window.addEventListener("blur", cancel);
    window.addEventListener("resize", cancel);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("blur", cancel);
      window.removeEventListener("resize", cancel);
    };
  }, [dragging, value, renderWidget]);

  function move(id: string, zone: DashboardZone, beforeId?: string) {
    const next = moveDashboardItem(value, id, zone, beforeId);
    pendingFocus.current = id;
    onChange(next);
    const title = widgets.find((widget) => widget.id === id)!.title;
    const position =
      next
        .filter((item) => item.zone === zone)
        .findIndex((item) => item.id === id) + 1;
    setAnnouncement(
      zone === "hidden" && renderWidget
        ? `${title} hidden. Restore it from the widget catalog.`
        : `${title} moved to ${dashboardZoneNames[zone]}, position ${position}.`,
    );
  }
  // Radix restores trigger focus after the layout effect. Menu moves need a second,
  // explicit destination so a surviving trigger cannot steal focus back from the handle.
  function closeMenu(event: Event) {
    if (!menuFocus.current) return;
    event.preventDefault();
    (handles.current.get(menuFocus.current) ?? root.current)?.focus();
    menuFocus.current = null;
  }
  function reorder(item: DashboardItem, direction: -1 | 1) {
    const zoneItems = value.filter((entry) => entry.zone === item.zone);
    const index = zoneItems.findIndex((entry) => entry.id === item.id);
    move(
      item.id,
      item.zone,
      direction === -1 ? zoneItems[index - 1]?.id : zoneItems[index + 2]?.id,
    );
  }
  function dropTarget(x: number, y: number): DropTarget | null {
    const element = document.elementFromPoint(x, y);
    const zoneElement = element?.closest<HTMLElement>("[data-editor-zone]");
    if (!zoneElement || !root.current?.contains(zoneElement)) return null;
    const zone = zoneElement.dataset.editorZone as DashboardZone;
    if (element?.closest("[data-drop-preview]"))
      return drag.current?.destination ?? { zone, beforeId: drag.current?.id };
    const card = element?.closest<HTMLElement>("[data-editor-card]");
    if (!card) return { zone };
    const rect = card.getBoundingClientRect();
    const entries = value.filter(
      (item) => item.zone === zone && item.id !== drag.current?.id,
    );
    const index = entries.findIndex(
      (item) => item.id === card.dataset.editorCard,
    );
    // In a grid, use the horizontal midpoint for cards sharing the same row; vertical
    // hit testing remains natural in the one-column/mobile layout and at card edges.
    const sameRow = Array.from(
      zoneElement.querySelectorAll<HTMLElement>("[data-editor-card]"),
    ).some(
      (other) =>
        other !== card &&
        other.dataset.editorCard !== drag.current?.id &&
        Math.abs(other.getBoundingClientRect().top - rect.top) < 4,
    );
    const before =
      renderWidget && sameRow
        ? x < rect.left + rect.width / 2
        : y < rect.top + rect.height / 2;
    return {
      zone,
      beforeId: before ? entries[index]?.id : entries[index + 1]?.id,
    };
  }
  function clearDrag() {
    const session = drag.current;
    if (session?.started) pendingFocus.current = session.id;
    if (session)
      session.scrollContainer.style.overflowAnchor = session.overflowAnchor;
    drag.current = null;
    if (session && root.current?.hasPointerCapture(session.pointerId))
      root.current.releasePointerCapture(session.pointerId);
    setDragging(null);
    setTarget(null);
    setOffset({ x: 0, y: 0 });
    setGeometry(undefined);
  }
  function pointerDown(event: PointerEvent<HTMLButtonElement>, id: string) {
    if (event.button !== 0 || !event.isPrimary || drag.current) return;
    event.currentTarget.focus({ preventScroll: true });
    // Capture on the stable editor, since inserting a preview may move the handle's DOM node.
    root.current!.setPointerCapture(event.pointerId);
    pointer.current = { x: event.clientX, y: event.clientY };
    const scrollContainer = findScrollContainer(event.currentTarget);
    const overflowAnchor = scrollContainer.style.overflowAnchor;
    scrollContainer.style.overflowAnchor = "none";
    const card =
      event.currentTarget.closest<HTMLElement>("[data-editor-card]")!;
    const bounds = card.getBoundingClientRect();
    const rootBounds = root.current!.getBoundingClientRect();
    drag.current = {
      id,
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      started: false,
      scrollY: scrollContainer.scrollTop,
      lastScrollY: scrollContainer.scrollTop,
      overflowAnchor,
      scrollContainer,
      geometry: {
        x: bounds.left - rootBounds.left,
        y: bounds.top - rootBounds.top,
        width: bounds.width,
        height: bounds.height,
      },
      destination: null,
    };
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    const session = drag.current;
    if (!session || session.pointerId !== event.pointerId) return;
    if (
      !session.started &&
      Math.hypot(event.clientX - session.x, event.clientY - session.y) < 8
    )
      return;
    if (!session.started) root.current?.focus({ preventScroll: true });
    session.started = true;
    session.lastScrollY = session.scrollContainer.scrollTop;
    pointer.current = { x: event.clientX, y: event.clientY };
    setDragging(session.id);
    setGeometry(session.geometry);
    setOffset({
      x: event.clientX - session.x,
      y:
        event.clientY -
        session.y +
        session.scrollContainer.scrollTop -
        session.scrollY,
    });
    const destination = dropTarget(event.clientX, event.clientY);
    session.destination = destination;
    setTarget(destination);
  }
  function pointerUp(event: PointerEvent<HTMLDivElement>) {
    const session = drag.current;
    if (session?.pointerId !== event.pointerId) return;
    // Commit the preview the user sees, not a fresh hit test against its reflowed grid.
    const destination = session.started ? session.destination : null;
    clearDrag();
    if (destination) move(session.id, destination.zone, destination.beforeId);
    else if (session.started)
      setAnnouncement("Move cancelled. Layout unchanged.");
  }

  const preview =
    dragging && target
      ? moveDashboardItem(value, dragging, target.zone, target.beforeId)
      : value;
  return (
    <div
      ref={root}
      tabIndex={-1}
      aria-label="Dashboard layout editor"
      className={`sui-dashboard-editor ${className}`}
      data-drag-active={Boolean(dragging) || undefined}
      onPointerMove={pointerMove}
      onPointerUp={pointerUp}
      onPointerCancel={clearDrag}
      onLostPointerCapture={clearDrag}
      onKeyDownCapture={(event) => {
        if (event.key === "Escape" && drag.current) {
          clearDrag();
          setAnnouncement("Move cancelled. Layout unchanged.");
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    >
      <p id={instructions} className="text-sui-body-sm text-sui-text-secondary">
        {renderWidget
          ? "Drag a widget by its handle and drop it in the highlighted position. Use Widget actions for keyboard controls."
          : "Drag cards between zones, or use Move to… and the reorder controls."}
      </p>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>
      <div
        className={
          renderWidget ? "sui-dashboard-canvas" : "sui-dashboard-board"
        }
      >
        {dashboardZones
          .filter((zone) => !renderWidget || zone !== "hidden")
          .map((zone) => {
            const entries = value.filter((item) => item.zone === zone);
            const previewEntries = preview.filter((item) => item.zone === zone);
            const placeholder =
              geometry && previewEntries.find((item) => item.id === dragging);
            const rendered: { item: DashboardItem; placeholder?: boolean }[] =
              entries.map((item) => ({ item }));
            if (placeholder) {
              const nextId =
                previewEntries[previewEntries.indexOf(placeholder) + 1]?.id;
              const before = rendered.findIndex(
                ({ item }) => item.id === nextId,
              );
              rendered.splice(before < 0 ? rendered.length : before, 0, {
                item: placeholder,
                placeholder: true,
              });
            }
            return (
              <section
                key={zone}
                aria-label={`${dashboardZoneNames[zone]} editor zone`}
                data-editor-zone={zone}
                data-drop-target={target?.zone === zone || undefined}
                className={
                  renderWidget
                    ? "sui-dashboard-canvas-zone"
                    : "sui-dashboard-zone"
                }
              >
                <header className="flex items-center gap-2">
                  <h3 className="flex-1 text-sui-heading-xs">
                    {dashboardZoneNames[zone]}
                  </h3>
                  <span
                    className="text-sui-label-sm text-sui-text-secondary"
                    aria-label={`${previewEntries.length} widgets`}
                  >
                    {previewEntries.length}
                  </span>
                </header>
                {!renderWidget && (
                  <p className="text-sui-caption-md text-sui-text-secondary">
                    {descriptions[zone]}
                  </p>
                )}
                <div
                  className={
                    renderWidget ? "sui-dashboard-grid" : "flex flex-col gap-4"
                  }
                >
                  {rendered.map(({ item, placeholder: isPlaceholder }) => {
                    if (isPlaceholder)
                      return (
                        <div
                          key="drop-preview"
                          aria-hidden="true"
                          data-drop-preview
                          data-size={item.size}
                          className="sui-dashboard-slot sui-dashboard-drop-preview"
                          style={{ height: geometry!.height }}
                        />
                      );
                    const index = entries.indexOf(item);
                    const widget = widgets.find(
                      (widget) => widget.id === item.id,
                    )!;
                    if (renderWidget)
                      return (
                        <DashboardLiveCard
                          key={`widget:${item.id}`}
                          widget={widget}
                          item={item}
                          index={index}
                          count={entries.length}
                          dragging={dragging === item.id}
                          offset={offset}
                          geometry={geometry}
                          handleProps={{
                            ref: (node) => {
                              if (node) handles.current.set(item.id, node);
                              else handles.current.delete(item.id);
                            },
                            "aria-describedby": instructions,
                            onPointerDown: (event) =>
                              pointerDown(event, item.id),
                          }}
                          onSizeChange={(size) => {
                            onChange(
                              value.map((entry) =>
                                entry.id === item.id
                                  ? { ...entry, size }
                                  : entry,
                              ),
                            );
                            setAnnouncement(
                              `${widget.title} size set to ${sizeNames[size]}.`,
                            );
                          }}
                          onMove={(destination) => {
                            menuFocus.current = item.id;
                            move(item.id, destination);
                          }}
                          onReorder={(direction) => {
                            menuFocus.current = item.id;
                            reorder(item, direction);
                          }}
                          onCloseMenu={closeMenu}
                        >
                          {renderWidget(widget, item)}
                        </DashboardLiveCard>
                      );
                    return (
                      <div
                        key={`widget:${item.id}`}
                        className="sui-dashboard-edit-slot"
                        role="group"
                        aria-label={widget.title}
                        data-editor-card={item.id}
                        data-dragging={dragging === item.id || undefined}
                        style={dragSlotStyle(
                          dragging === item.id ? geometry : undefined,
                        )}
                      >
                        <Card
                          padding="compact"
                          className="sui-dashboard-live-card"
                          style={
                            dragging === item.id
                              ? {
                                  transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
                                }
                              : undefined
                          }
                        >
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              ref={(node) => {
                                if (node) handles.current.set(item.id, node);
                                else handles.current.delete(item.id);
                              }}
                              aria-label={`Drag ${widget.title}`}
                              aria-describedby={instructions}
                              className="sui-dashboard-drag"
                              onPointerDown={(event) =>
                                pointerDown(event, item.id)
                              }
                            >
                              <AssetIcon src={dragIcon} size={16} />
                            </button>
                            <h4 className="min-w-0 break-words text-sui-heading-xs">
                              {widget.title}
                            </h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="sui-dashboard-chip">
                              {widget.kind}
                            </span>
                            <span
                              className="sui-dashboard-chip"
                              data-size-chip
                              aria-label={`${sizeNames[item.size]} widget`}
                            >
                              {item.size}
                            </span>
                          </div>
                          <CardFooter>
                            <DashboardWidgetSettings
                              title={widget.title}
                              size={item.size}
                              sizes={widget.sizes}
                              onSizeChange={(size) => {
                                onChange(
                                  value.map((entry) =>
                                    entry.id === item.id
                                      ? { ...entry, size }
                                      : entry,
                                  ),
                                );
                                setAnnouncement(
                                  `${widget.title} size set to ${sizeNames[size]}.`,
                                );
                              }}
                            />
                            {zone === "hidden" ? (
                              <Button
                                variant="secondary"
                                leftIcon={
                                  <AssetIcon src={showIcon} size={16} />
                                }
                                onClick={() =>
                                  move(item.id, widget.defaultZone)
                                }
                              >
                                Show
                              </Button>
                            ) : (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="secondary"
                                    rightIcon={
                                      <AssetIcon src={chevronIcon} size={16} />
                                    }
                                  >
                                    Move to…
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  onCloseAutoFocus={closeMenu}
                                >
                                  {dashboardZones
                                    .filter(
                                      (destination) => destination !== zone,
                                    )
                                    .map((destination) => (
                                      <DropdownMenuItem
                                        key={destination}
                                        onSelect={() => {
                                          menuFocus.current = item.id;
                                          move(item.id, destination);
                                        }}
                                      >
                                        {dashboardZoneNames[destination]}
                                      </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </CardFooter>
                          <CardFooter>
                            <Button
                              variant="secondary"
                              disabled={index === 0}
                              onClick={() => reorder(item, -1)}
                            >
                              Move up
                            </Button>
                            <Button
                              variant="secondary"
                              disabled={index === entries.length - 1}
                              onClick={() => reorder(item, 1)}
                            >
                              Move down
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    );
                  })}
                </div>
                {!previewEntries.length && (
                  <p className="rounded-sui-control border border-dashed border-sui-border-default p-4 text-sui-body-sm text-sui-text-secondary">
                    Drop a widget here or use its Move to… menu.
                  </p>
                )}
              </section>
            );
          })}
      </div>
    </div>
  );
}
