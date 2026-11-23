import type { ComponentPropsWithRef, ComponentPropsWithoutRef } from "react";
import * as Primitive from "@radix-ui/react-popover";

export type PopoverProps = ComponentPropsWithoutRef<typeof Primitive.Root>;
export type PopoverContentProps = ComponentPropsWithRef<
  typeof Primitive.Content
>;
export const Popover = Primitive.Root;
export const PopoverTrigger = Primitive.Trigger;
export const PopoverClose = Primitive.Close;
/** Interactive contextual content: name the dialog and keep actions reachable by keyboard/touch. */
export function PopoverContent({
  className = "",
  sideOffset = 8,
  collisionPadding = 16,
  ...props
}: PopoverContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        {...props}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={`sui-floating sui-popover ${className}`}
      />
    </Primitive.Portal>
  );
}
