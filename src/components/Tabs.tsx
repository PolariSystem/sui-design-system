import type { ComponentPropsWithRef, ReactNode } from "react";
import * as Primitive from "@radix-ui/react-tabs";
import { Slottable } from "@radix-ui/react-slot";

export type TabsProps = ComponentPropsWithRef<typeof Primitive.Root>;
export type TabsListProps = ComponentPropsWithRef<typeof Primitive.List>;
export interface TabsTriggerProps extends ComponentPropsWithRef<
  typeof Primitive.Trigger
> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}
export type TabsContentProps = ComponentPropsWithRef<typeof Primitive.Content>;

/** Panels are activated automatically by default; use manual activation for costly panel loads. */
export function Tabs({ className = "", ...props }: TabsProps) {
  return (
    <Primitive.Root
      {...props}
      className={`sui-tabs min-w-0 font-sui ${className}`}
    />
  );
}
export function TabsList({ className = "", ...props }: TabsListProps) {
  return (
    <Primitive.List
      {...props}
      className={`sui-tabs-list flex min-w-0 gap-2 overflow-x-auto p-1 ${className}`}
    />
  );
}
/** With asChild, supply one focusable control that forwards tab props and its ref. */
export function TabsTrigger({
  asChild = false,
  leftIcon,
  rightIcon,
  children,
  className = "",
  ...props
}: TabsTriggerProps) {
  return (
    <Primitive.Trigger
      {...props}
      asChild={asChild}
      className={`sui-tab inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-sui-control border border-transparent px-4 font-sui text-sui-label-md text-sui-text-body focus-visible:outline-2 focus-visible:outline-sui-border-focus focus-visible:shadow-sui-focus-default disabled:cursor-not-allowed disabled:border-sui-border-control disabled:bg-sui-surface-canvas disabled:text-sui-text-disabled ${className}`}
    >
      {leftIcon && (
        <span aria-hidden="true" className="inline-flex size-4 shrink-0">
          {leftIcon}
        </span>
      )}
      {/* Keep the supplied control as the tab's focus and event target. */}
      {asChild ? (
        <Slottable child={children}>{(content) => <span>{content}</span>}</Slottable>
      ) : (
        <span>{children}</span>
      )}
      {rightIcon && (
        <span aria-hidden="true" className="inline-flex size-4 shrink-0">
          {rightIcon}
        </span>
      )}
    </Primitive.Trigger>
  );
}
export function TabsContent({ className = "", ...props }: TabsContentProps) {
  return (
    <Primitive.Content
      {...props}
      className={`sui-tab-panel mt-4 min-w-0 rounded-sui-xs text-sui-body-md text-sui-text-body focus-visible:outline-2 focus-visible:outline-sui-border-focus ${className}`}
    />
  );
}
