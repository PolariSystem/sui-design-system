import {
  Button,
  Card,
  ScrollArea,
  ScrollAreaViewport,
  ScrollBar,
} from "../src";
import { useState } from "react";
import { Example, Section } from "./components";

export function ScrollAreas() {
  const [count, setCount] = useState(12);
  return (
    <Section
      name="ScrollArea"
      description="Overlay scrollbars, rounded viewports, and uninterrupted native scrolling. The 4 px indicator stays 4 px inside the edge without moving content."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h2 className="text-sui-heading-xs">Vertical</h2>
          <ScrollArea className="h-64 rounded-sui-control border border-sui-border-default">
            <ScrollAreaViewport aria-label="Workspace activity">
              <div className="grid gap-4 p-4">
                {Array.from({ length: count }, (_, i) => (
                  <div
                    key={i}
                    className="rounded-sui-control bg-sui-surface-canvas p-4"
                  >
                    Workspace update {i + 1}
                  </div>
                ))}
              </div>
            </ScrollAreaViewport>
            <ScrollBar />
          </ScrollArea>
          <Button
            variant="secondary"
            onClick={() => setCount(count === 12 ? 2 : 12)}
          >
            {count === 12 ? "Show fewer items" : "Show all items"}
          </Button>
        </Card>
        <Card>
          <h2 className="text-sui-heading-xs">Horizontal</h2>
          <ScrollArea className="rounded-sui-control border border-sui-border-default">
            <ScrollAreaViewport aria-label="Project milestones">
              <div className="flex w-max gap-4 p-4">
                {["Research", "Foundations", "Components", "Validation"].map(
                  (label) => (
                    <div
                      key={label}
                      className="w-40 rounded-sui-control bg-sui-surface-canvas p-4"
                    >
                      {label}
                    </div>
                  ),
                )}
              </div>
            </ScrollAreaViewport>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Card>
      </div>
      <Example>
        <p className="text-sui-body-md text-sui-text-secondary">
          Constrain the root height for vertical scrolling. Keep padding inside
          the viewport. Wheel, touch, keyboard, track clicks, and thumb dragging
          use the same scroll position. Indicators disappear when content fits;
          focus remains visible in both themes.
        </p>
      </Example>
    </Section>
  );
}
