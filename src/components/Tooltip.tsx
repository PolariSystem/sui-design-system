import type { ComponentPropsWithoutRef, ReactElement } from "react";
import * as Primitive from "@radix-ui/react-tooltip";

export const TooltipProvider = Primitive.Provider;
export interface TooltipProps extends ComponentPropsWithoutRef<
  typeof Primitive.Root
> {
  children: ReactElement;
  content: string;
  side?: "top" | "right" | "bottom" | "left";
}
/** Supplementary text only. Interactive content belongs in Popover, never role=tooltip. */
export function Tooltip({
  children,
  content,
  side = "top",
  ...props
}: TooltipProps) {
  return (
    <Primitive.Root {...props}>
      <Primitive.Trigger asChild>{children}</Primitive.Trigger>
      <Primitive.Portal>
        <Primitive.Content
          side={side}
          sideOffset={8}
          collisionPadding={16}
          className="sui-floating sui-tooltip"
        >
          {content}
        </Primitive.Content>
      </Primitive.Portal>
    </Primitive.Root>
  );
}
