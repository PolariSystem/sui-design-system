import type { ComponentPropsWithRef } from "react";

/** Preserve the original Solar artwork in light mode; its alpha mask follows semantic ink in dark mode.
 * Use only for monochrome/duotone controls, never for multicolor illustrations or photographs. */
export function AssetIcon({
  src,
  size = 20,
  className = "",
  style,
  ...props
}: Omit<ComponentPropsWithRef<"span">, "children"> & {
  src: string;
  size?: number;
}) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={`sui-asset-icon ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      <img src={src} alt="" draggable={false} />
      <span className="sui-asset-ink" style={{ maskImage: `url("${src}")` }} />
    </span>
  );
}
