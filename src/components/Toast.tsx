import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ReactNode,
} from "react";
import * as Primitive from "@radix-ui/react-toast";
import { Button } from "./Button";
import { CardFooter } from "./Card";
import success from "../assets/toast-success.svg";

export type ToastProviderProps = ComponentPropsWithoutRef<
  typeof Primitive.Provider
>;
export interface ToastViewportProps extends ComponentPropsWithRef<
  typeof Primitive.Viewport
> {
  inline?: boolean;
  /** Floating notification position. Inline workshop previews ignore this setting. */
  position?: "top-right" | "bottom-right";
}
export interface ToastProps extends Omit<
  ComponentPropsWithRef<typeof Primitive.Root>,
  "title" | "children" | "asChild"
> {
  title: string;
  description?: ReactNode;
  action?: { label: string; altText: string; onClick: () => void };
  dismissLabel?: string;
  dismissible?: boolean;
}

/** One provider/viewport per application notification region. F8 focuses its actions. */
export function ToastProvider(props: ToastProviderProps) {
  return <Primitive.Provider {...props} />;
}
export function ToastViewport({
  inline = false,
  position = "bottom-right",
  className = "",
  ...props
}: ToastViewportProps) {
  return (
    <Primitive.Viewport
      {...props}
      data-inline={inline}
      data-position={position}
      className={`sui-toast-viewport flex flex-col gap-2 outline-none ${inline ? "relative w-full overflow-visible p-0" : `fixed right-4 z-50 max-h-[calc(100dvh-32px)] w-[448px] max-w-[calc(100vw-32px)] overflow-y-auto p-1 ${position === "top-right" ? "top-4" : "bottom-4"}`} ${className}`}
    />
  );
}

/** Actionable messages persist by default; compact feedback follows the provider duration. */
export function Toast({
  title,
  description,
  action,
  dismissLabel = "Dismiss",
  dismissible = Boolean(action),
  duration,
  type = "background",
  className = "",
  ...props
}: ToastProps) {
  return (
    <Primitive.Root
      {...props}
      type={type}
      duration={duration ?? (action ? Infinity : undefined)}
      className={`sui-toast flex min-w-0 flex-col gap-4 rounded-sui-card border border-sui-border-subtle bg-sui-surface-default p-4 font-sui shadow-sui-elevation-raised focus-visible:outline-2 focus-visible:outline-sui-border-focus ${className}`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <img src={success} alt="" className="shrink-0" />
        <div className="flex min-w-0 flex-1 flex-col gap-1 break-words">
          <Primitive.Title className="text-sui-label-lg text-sui-text-primary">
            {title}
          </Primitive.Title>
          {description && (
            <Primitive.Description className="text-sui-body-sm text-sui-text-secondary">
              {description}
            </Primitive.Description>
          )}
        </div>
      </div>
      {(action || dismissible) && (
        <CardFooter>
          {dismissible && (
            <Primitive.Close asChild>
              <Button
                variant="secondary"
                size="lg"
                className="text-sui-label-lg"
              >
                {dismissLabel}
              </Button>
            </Primitive.Close>
          )}
          {action && (
            <Primitive.Action altText={action.altText} asChild>
              <Button
                variant="secondary"
                size="lg"
                className="text-sui-label-lg"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            </Primitive.Action>
          )}
        </CardFooter>
      )}
    </Primitive.Root>
  );
}
