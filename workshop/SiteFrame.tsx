import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import {
  ScrollArea,
  ScrollAreaViewport,
  ScrollBar,
  IconButton,
  Link,
} from "../src";
import { repositoryHref } from "./site-config";
import { SupportLink } from "./SupportLink";
import { Brand } from "./Navigation";
import { ThemeSelector } from "./theme";
import { SiteIndex } from "./SiteIndex";
import {
  figmaAccessHref,
  sectionForRoute,
  siteSections,
} from "./site-navigation";
import home from "./assets/site-home.svg";
import homeActive from "./assets/site-home-active.svg";
import components from "./assets/site-components.svg";
import componentsActive from "./assets/site-components-active.svg";
import pages from "./assets/site-pages.svg";
import pagesActive from "./assets/site-pages-active.svg";
import documentation from "./assets/site-documentation.svg";
import documentationActive from "./assets/site-documentation-active.svg";
import figma from "./assets/site-figma.svg";
import menu from "./assets/site-menu.svg";
import close from "./assets/site-close.svg";
import "./site-navigation.css";
import "./site-background.css";

const icons = {
  home: [home, homeActive],
  components: [components, componentsActive],
  pages: [pages, pagesActive],
  documentation: [documentation, documentationActive],
};

/** Original Figma artwork inherits the semantic foreground without changing its paths. */
function SiteIcon({ src }: { src: string }) {
  return (
    <span
      aria-hidden="true"
      className="site-icon"
      style={{ maskImage: `url("${src}")` }}
    />
  );
}

/** Focus a route or an in-page destination after React has committed the next view. */
function focusDestination(fragment: string) {
  const [route, anchor] = fragment.slice(1).split("/");
  const destination = anchor
    ? document.getElementById(`${route}-${anchor}`)
    : document.querySelector<HTMLElement>("main");
  destination?.focus({ preventScroll: true });
  if (anchor)
    destination?.scrollIntoView({ block: "start", behavior: "instant" });
  else {
    (
      destination?.querySelector<HTMLElement>("[data-sui-scroll-viewport]") ??
      destination
    )?.scrollTo({ top: 0, behavior: "instant" });
    window.scrollTo({ top: 0, behavior: "instant" });
  }
}

/** Shared website chrome. Opening an index never remounts the underlying examples. */
export function SiteFrame({
  children,
  fragment,
}: {
  children: ReactNode;
  fragment: string;
}) {
  const section = sectionForRoute(fragment.slice(1).split("/")[0]);
  const current = siteSections.find((item) => item.id === section)!;
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const indexId = useId();
  const closeIndex = () => {
    setOpen(false);
    menuButton.current?.focus({ preventScroll: true });
  };
  const navigate = (href: string) => {
    setOpen(false);
    if (href === fragment) requestAnimationFrame(() => focusDestination(href));
  };
  const followLink = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    if (href === fragment) event.preventDefault();
    navigate(href);
  };
  useEffect(() => {
    setOpen(false);
    // Initial fragment navigation can scroll directly to a specimen's DOM id.
    // Normalize it too, so the floating header never covers the page context.
    const frame = requestAnimationFrame(() => focusDestination(fragment));
    return () => cancelAnimationFrame(frame);
  }, [fragment]);
  useEffect(() => {
    if (!open) return;
    // The index is nonmodal: header and bottom navigation remain operable.
    // Lock background scrolling while keeping its layout and form state mounted.
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !event.defaultPrevented &&
        !document.querySelector('[role="dialog"], [role="menu"]')
      ) {
        event.preventDefault();
        closeIndex();
      }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const resize = () => {
      if (desktop.matches) {
        setOpen(false);
        requestAnimationFrame(() =>
          document
            .querySelector<HTMLElement>("main")
            ?.focus({ preventScroll: true }),
        );
      }
    };
    document.addEventListener("keydown", escape);
    desktop.addEventListener("change", resize);
    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", escape);
      desktop.removeEventListener("change", resize);
    };
  }, [open]);
  return (
    <>
      <header className="site-header">
        <a
          href="#home"
          aria-label="Serenity UI home"
          className="site-brand"
          onClick={(event) => followLink(event, "#home")}
        >
          <span className="site-brand-full">
            <Brand />
          </span>
          <span className="site-brand-compact">
            <Brand compact />
          </span>
        </a>
        <nav aria-label="Website" className="site-desktop-nav">
          {siteSections.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              aria-current={section === item.id ? "page" : undefined}
              onClick={(event) => followLink(event, item.href)}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="site-header-actions">
          <SupportLink />
          <ThemeSelector />
          <Link
            href={figmaAccessHref}
            onClick={(event) => followLink(event, figmaAccessHref)}
            aria-label="Figma access"
            className="site-figma-link"
          >
            <span className="site-figma-label">Figma access</span>
            <span className="site-figma-icon">
              <SiteIcon src={figma} />
            </span>
          </Link>
          <Link
            href={repositoryHref}
            className="site-source-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </Link>
        </div>
      </header>
      <div
        className="site-content site-grid"
        inert={open}
        data-index-open={open}
      >
        {children}
      </div>
      {open && (
        <ScrollArea asChild style={{ position: "fixed" }}>
          <main
            id={indexId}
            className="site-mobile-index"
            aria-label={`${current.name} index`}
          >
            <ScrollAreaViewport aria-label={`${current.name} index content`}>
              <div className="site-mobile-index-content">
                <h1>{current.name}</h1>
                <SiteIndex
                  key={section}
                  section={section}
                  fragment={fragment}
                  autoFocus
                  onNavigate={navigate}
                />
              </div>
            </ScrollAreaViewport>
            <ScrollBar />
          </main>
        </ScrollArea>
      )}
      <nav aria-label="Website sections" className="site-bottom-nav">
        {siteSections.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            aria-label={item.name}
            aria-current={item.id === section ? "page" : undefined}
            className="site-section-link"
            onClick={(event) => followLink(event, item.href)}
          >
            <SiteIcon src={icons[item.id][item.id === section ? 1 : 0]} />
          </Link>
        ))}
        <span className="site-nav-divider" aria-hidden="true" />
        <IconButton
          ref={menuButton}
          aria-label={`${open ? "Close" : "Open"} ${current.name} index`}
          aria-expanded={open}
          aria-controls={open ? indexId : undefined}
          variant={open ? "secondary" : "primary"}
          icon={<SiteIcon src={open ? close : menu} />}
          onClick={() => (open ? closeIndex() : setOpen(true))}
        />
      </nav>
    </>
  );
}
