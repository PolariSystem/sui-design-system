import { useEffect, useRef, type ReactNode } from "react";
import { Badge, ScrollArea, ScrollAreaViewport, ScrollBar } from "../src";
import { catalog, resolveRoute } from "./catalog";
import { RouteContext } from "./route-context";
import { SiteIndex } from "./SiteIndex";
import { sectionForRoute, sectionEntries } from "./site-navigation";
import { repositoryHref } from "./site-config";

/** Hash navigation works on static hosts and keeps browser back/forward behavior native. */
export function WorkshopShell({
  children,
  fragment,
}: {
  children: ReactNode;
  fragment: string;
}) {
  const route = resolveRoute(fragment);
  const mainRef = useRef<HTMLElement>(null);
  const section = sectionForRoute(route);
  const entries = sectionEntries[section];
  const active = catalog.find((item) => item.id === route);
  const position = entries.findIndex((item) => item.href === `#${route}`);
  useEffect(() => {
    document.title = `${active?.name ?? "Page not found"} · Serenity UI`;
  }, [route, active?.name]);
  return (
    <RouteContext value={route}>
      <a
        href="#main"
        className="docs-skip"
        onClick={(event) => {
          // Moving focus within the current page must not create a history entry.
          event.preventDefault();
          mainRef.current?.focus({ preventScroll: true });
        }}
      >
        Skip to content
      </a>
      <div className="docs-layout">
        <ScrollArea
          asChild
          className="docs-sidebar"
          style={{ position: "sticky" }}
        >
          <aside>
            <ScrollAreaViewport aria-label="Component index">
              <div className="docs-sidebar-content">
                <SiteIndex
                  key={section}
                  section={section}
                  fragment={fragment}
                  showSearchIcon
                />
              </div>
            </ScrollAreaViewport>
            <ScrollBar />
          </aside>
        </ScrollArea>
        <ScrollArea asChild className="docs-main">
          <main id="main" ref={mainRef} tabIndex={-1}>
            <ScrollAreaViewport
              aria-label={`${active?.name ?? "Workshop"} content`}
            >
              <div className="docs-main-content">
                <div className="docs-context">
                  <span>{active?.group ?? "Explore"}</span>
                  <a href={repositoryHref} aria-label="Open-source repository">
                    <Badge tone="info">Open source · MIT</Badge>
                  </a>
                </div>
                <div key={route} className="docs-page">
                  {route === "not-found" ? (
                    <>
                      <h1>Page not found</h1>
                      <p>Choose a component from the library.</p>
                      <a href="#foundations">Go to foundations</a>
                    </>
                  ) : (
                    children
                  )}
                </div>
                <nav className="docs-pagination" aria-label="Adjacent pages">
                  {position > 0 ? (
                    <a href={entries[position - 1].href}>
                      <span>Previous</span>
                      {entries[position - 1].name}
                    </a>
                  ) : (
                    <span />
                  )}
                  {position >= 0 && position < entries.length - 1 && (
                    <a href={entries[position + 1].href}>
                      <span>Next</span>
                      {entries[position + 1].name}
                    </a>
                  )}
                </nav>
                <footer className="docs-footer">
                  Serenity UI · A clear foundation. Room to build.
                  <a href="#motion">Explore our motion system ↗</a>
                </footer>
              </div>
            </ScrollAreaViewport>
            <ScrollBar />
          </main>
        </ScrollArea>
      </div>
    </RouteContext>
  );
}
