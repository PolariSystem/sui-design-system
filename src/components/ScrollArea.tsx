import type { ComponentPropsWithRef } from "react";
import * as Primitive from "@radix-ui/react-scroll-area";

export type ScrollAreaProps = ComponentPropsWithRef<typeof Primitive.Root>;
export type ScrollAreaViewportProps = ComponentPropsWithRef<
  typeof Primitive.Viewport
>;
export type ScrollBarProps = Omit<
  ComponentPropsWithRef<typeof Primitive.Scrollbar>,
  "children"
>;

/** A bounded scroll region with overlay indicators. Give the root a height or width constraint. */
export function ScrollArea({
  className = "",
  type = "auto",
  ...props
}: ScrollAreaProps) {
  return (
    <Primitive.Root
      {...props}
      type={type}
      className={`sui-scroll-area ${className}`}
    />
  );
}

/** Keep padding on an inner content wrapper so the indicator follows the container edge. */
export function ScrollAreaViewport({
  className = "",
  tabIndex = 0,
  ...props
}: ScrollAreaViewportProps) {
  return (
    <Primitive.Viewport
      {...props}
      tabIndex={tabIndex}
      data-sui-scroll-viewport=""
      className={`sui-scroll-viewport ${className}`}
    />
  );
}

/** The 4 px thumb sits inside a wider pointer target without reserving a content gutter. */
export function ScrollBar({
  className = "",
  orientation = "vertical",
  style,
  ...props
}: ScrollBarProps) {
  const inset = "var(--sui-space-scrollbar-inset)";
  return (
    <Primitive.Scrollbar
      {...props}
      orientation={orientation}
      className={`sui-scrollbar ${className}`}
      style={{
        ...(orientation === "vertical"
          ? { top: inset, bottom: inset }
          : { left: inset, right: inset }),
        ...style,
      }}
    >
      <Primitive.Thumb className="sui-scrollbar-thumb" />
    </Primitive.Scrollbar>
  );
}
