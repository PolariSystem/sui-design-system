import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ReactNode,
} from "react";
import * as Primitive from "@radix-ui/react-dropdown-menu";
import { Slottable } from "@radix-ui/react-slot";

export type DropdownMenuProps = ComponentPropsWithoutRef<typeof Primitive.Root>;
export type DropdownMenuContentProps = ComponentPropsWithRef<
  typeof Primitive.Content
>;
export interface DropdownMenuItemProps extends ComponentPropsWithRef<
  typeof Primitive.Item
> {
  danger?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}
export const DropdownMenu = Primitive.Root;
export const DropdownMenuTrigger = Primitive.Trigger;
/** Actions use menu semantics; selecting field values remains the Select component's responsibility. */
export function DropdownMenuContent({
  className = "",
  sideOffset = 8,
  collisionPadding = 16,
  ...props
}: DropdownMenuContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Content
        {...props}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={`sui-floating sui-action-menu ${className}`}
      />
    </Primitive.Portal>
  );
}
/** With asChild, supply one control that forwards its props and ref; icons remain decorative. */
export function DropdownMenuItem({
  asChild = false,
  danger = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  ...props
}: DropdownMenuItemProps) {
  return (
    <Primitive.Item
      {...props}
      asChild={asChild}
      data-danger={danger}
      className={`sui-menu-item ${className}`}
    >
      {leftIcon && (
        <span aria-hidden className="inline-flex shrink-0">
          {leftIcon}
        </span>
      )}
      {/* Slot the consumer's element while keeping icons and the label inside it. */}
      {asChild ? (
        <Slottable child={children}>
          {(content) => <span className="min-w-0 flex-1 break-words">{content}</span>}
        </Slottable>
      ) : (
        <span className="min-w-0 flex-1 break-words">{children}</span>
      )}
      {rightIcon && (
        <span aria-hidden className="inline-flex shrink-0">
          {rightIcon}
        </span>
      )}
    </Primitive.Item>
  );
}
