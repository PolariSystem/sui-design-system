import { useEffect, useRef, useState } from "react";
import { Button, Input } from "../src";
import { sectionEntries, type SiteSection } from "./site-navigation";
import search from "./assets/site-search.svg";

/** Search stays within the current section; hidden groups never leave empty headings. */
export function SiteIndex({
  section,
  fragment,
  autoFocus = false,
  showSearchIcon = false,
  onNavigate,
}: {
  section: SiteSection;
  fragment: string;
  autoFocus?: boolean;
  showSearchIcon?: boolean;
  onNavigate?: (href: string) => void;
}) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (autoFocus) input.current?.focus({ preventScroll: true });
  }, [autoFocus]);
  const normalize = (value: string) => value.toLowerCase().replace(/\s/g, "");
  const matching = sectionEntries[section].filter((item) =>
    normalize(item.name).includes(normalize(query)),
  );
  const groups = [...new Set(matching.map((item) => item.group))];
  return (
    <>
      <Input
        ref={input}
        label={`Search ${section}`}
        hideLabel
        size={showSearchIcon ? "standard" : "compact"}
        leftIcon={
          showSearchIcon ? (
            <span
              className="site-icon text-sui-icon-brand"
              style={{ maskImage: `url("${search}")` }}
            />
          ) : undefined
        }
        placeholder={`Search ${section}…`}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <nav
        aria-label={`${section === "components" ? "Component library" : section} index`}
        className="docs-catalog"
      >
        {groups.map((group) => (
          <div key={group}>
            <h2>{group}</h2>
            {matching
              .filter((item) => item.group === group)
              .map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={fragment === item.href ? "page" : undefined}
                  onClick={(event) => {
                    // Preserve new-tab and modified-click behavior of native links.
                    if (
                      !event.metaKey &&
                      !event.ctrlKey &&
                      !event.shiftKey &&
                      !event.altKey
                    ) {
                      if (fragment === item.href && onNavigate)
                        event.preventDefault();
                      onNavigate?.(item.href);
                    }
                  }}
                >
                  {item.name}
                </a>
              ))}
          </div>
        ))}
        {matching.length === 0 && (
          <div className="site-index-empty">
            <p role="status">No results found. Try another name.</p>
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                input.current?.focus();
              }}
            >
              Clear search
            </Button>
          </div>
        )}
      </nav>
    </>
  );
}
