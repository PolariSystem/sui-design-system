import { AssetIcon } from "./internal/AssetIcon";
import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  ReactNode,
} from "react";
import * as Primitive from "@radix-ui/react-dialog";
import closeIcon from "../assets/overlay-close.svg";
import { IconButton } from "./IconButton";

export type DrawerProps = ComponentPropsWithoutRef<typeof Primitive.Root>;
export const Drawer = Primitive.Root;
export const DrawerTrigger = Primitive.Trigger;
export const DrawerClose = Primitive.Close;
export interface DrawerContentProps extends Omit<
  ComponentPropsWithRef<typeof Primitive.Content>,
  "title" | "asChild"
> {
  title: string;
  description?: string;
  footer?: ReactNode;
  /** Optional navigation identity, shown above the title alongside the close action. */
  brand?: ReactNode;
  /** Decorative close artwork; closeLabel supplies the accessible action name. */
  closeIcon?: ReactNode;
  closeLabel?: string;
  side?: "left" | "right";
  size?: "content" | "navigation";
}

/** Modal side panel. Internal scrolling preserves the reachable heading and close action. */
export function DrawerContent({
  title,
  description,
  footer,
  brand,
  closeIcon: closeArtwork,
  closeLabel = "Close panel",
  side = "right",
  size = "content",
  children,
  className = "",
  ...props
}: DrawerContentProps) {
  return (
    <Primitive.Portal>
      <Primitive.Overlay className="sui-overlay" />
      <Primitive.Content
        {...props}
        {...(!description
          ? { "aria-describedby": props["aria-describedby"] }
          : {})}
        data-side={side}
        data-size={size}
        className={`sui-drawer sui-modal-surface ${className}`}
      >
        {brand && (
          <div className="sui-drawer-brand flex shrink-0 items-center justify-between gap-4">
            {brand}
            <Primitive.Close asChild>
              <IconButton
                aria-label={closeLabel}
                icon={closeArtwork ?? <AssetIcon src={closeIcon} />}
              />
            </Primitive.Close>
          </div>
        )}
        <header className="sui-drawer-heading flex shrink-0 items-start gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Primitive.Title className="sui-drawer-title text-sui-heading-sm">
              {title}
            </Primitive.Title>
            {description && (
              <Primitive.Description className="text-sui-body-sm text-sui-text-secondary">
                {description}
              </Primitive.Description>
            )}
          </div>
          {!brand && (
            <Primitive.Close
              className="sui-overlay-close"
              aria-label={closeLabel}
            >
              {closeArtwork ?? <AssetIcon src={closeIcon} />}
            </Primitive.Close>
          )}
        </header>
        <div className="sui-drawer-body min-h-0 flex-1 overflow-y-auto overscroll-contain p-1">
          {children}
        </div>
        {footer && <div className="sui-drawer-footer shrink-0">{footer}</div>}
      </Primitive.Content>
    </Primitive.Portal>
  );
}
