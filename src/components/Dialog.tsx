import { AssetIcon } from "./internal/AssetIcon";
import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ReactNode,
} from "react";
import * as Primitive from "@radix-ui/react-dialog";
import closeIcon from "../assets/overlay-close.svg";

export type DialogProps = ComponentPropsWithoutRef<typeof Primitive.Root>;
export const Dialog = Primitive.Root;
export const DialogTrigger = Primitive.Trigger;
export const DialogClose = Primitive.Close;
export interface DialogContentProps extends Omit<
  ComponentPropsWithRef<typeof Primitive.Content>,
  "title" | "asChild"
> {
  title: string;
  description?: string;
  icon?: ReactNode;
  footer?: ReactNode;
  closeLabel?: string;
  showClose?: boolean;
  variant?: "standard" | "featured";
}

/** Modal surface with named content, focus containment and restoration supplied by Radix. */
export function DialogContent({
  title,
  description,
  icon,
  footer,
  closeLabel = "Close dialog",
  showClose = true,
  variant = "standard",
  children,
  className = "",
  ...props
}: DialogContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="sui-overlay" />
      <Primitive.Content
        {...props}
        {...(!description
          ? { "aria-describedby": props["aria-describedby"] }
          : {})}
        className={`sui-dialog sui-modal-surface ${variant === "featured" ? "sui-dialog-featured" : ""} ${className}`}
      >
        <div
          className={
            variant === "featured"
              ? "flex items-start gap-4"
              : "flex items-center gap-3"
          }
        >
          {icon && (
            <span aria-hidden className="shrink-0">
              {icon}
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Primitive.Title
              className={
                variant === "featured"
                  ? "text-sui-heading-md"
                  : "text-sui-heading-xs"
              }
            >
              {title}
            </Primitive.Title>
            {description && variant === "featured" && (
              <Primitive.Description className="text-sui-body-md text-sui-text-secondary">
                {description}
              </Primitive.Description>
            )}
          </div>
          {showClose && (
            <Primitive.Close
              className="sui-overlay-close"
              aria-label={closeLabel}
            >
              <AssetIcon src={closeIcon} />
            </Primitive.Close>
          )}
        </div>
        {description && variant === "standard" && (
          <Primitive.Description className="text-sui-body-sm text-sui-text-secondary">
            {description}
          </Primitive.Description>
        )}
        {children}
        {footer}
      </Primitive.Content>
    </Primitive.Portal>
  );
}
