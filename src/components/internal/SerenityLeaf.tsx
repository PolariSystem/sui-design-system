import { useEffect, useId, useMemo, useRef, useState } from "react";
import desktop from "../../assets/auth-leaf-desktop.svg?raw";
import mobile from "../../assets/auth-leaf-mobile.svg?raw";

/** Only bundled, reviewed Figma SVGs enter this function; never accept consumer markup.
 * Inline the original paths for path trim, and scope fragment IDs for multiple compositions. */
function prepareLeaf(source: string, prefix: string) {
  return source
    .replace(/id="([^"]+)"/g, (_, id: string) => `id="${prefix}-${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_, id: string) => `url(#${prefix}-${id})`)
    .replace(
      /xlink:href="#([^"]+)"/g,
      (_, id: string) => `href="#${prefix}-${id}"`,
    )
    .replace(/fill-opacity="[^"]*"/g, "")
    .replace(/(<g\b[^>]*>)/, '$1<g class="sui-auth-leaf-glow">')
    .replace("</g>", "</g></g>")
    .replace("<path d=", '<path pathLength="1" d=');
}

export function SerenityLeaf({
  animated,
  paused,
}: {
  animated: boolean;
  paused: boolean;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const root = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const artwork = useMemo(
    () => ({
      desktop: prepareLeaf(desktop, `${id}-desktop`),
      mobile: prepareLeaf(mobile, `${id}-mobile`),
    }),
    [id],
  );
  useEffect(() => {
    if (!root.current) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    // Decoration sleeps outside the viewport; scrolling and form edits never remount its SVG.
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={root}
      className="sui-auth-leaf"
      data-animated={animated}
      data-paused={paused || !visible}
    >
      <div
        className="sui-auth-leaf-desktop"
        dangerouslySetInnerHTML={{ __html: artwork.desktop }}
      />
      <div
        className="sui-auth-leaf-mobile"
        dangerouslySetInnerHTML={{ __html: artwork.mobile }}
      />
    </div>
  );
}
