import { catalog } from "./catalog";
import { documentationGuides } from "./documentation-guides";

export type SiteSection = "home" | "components" | "pages" | "documentation";
export interface IndexEntry {
  name: string;
  href: string;
  group: string;
}

export const siteSections = [
  { id: "home", name: "Home", href: "#home" },
  { id: "components", name: "Components", href: "#button" },
  { id: "pages", name: "Pages", href: "#dashboard" },
  { id: "documentation", name: "Documentation", href: "#documentation" },
] as const;

export function sectionForRoute(route: string): SiteSection {
  if (route === "home") return "home";
  if (route === "documentation") return "documentation";
  return catalog.find((item) => item.id === route)?.group === "Concepts"
    ? "pages"
    : "components";
}

export const componentCatalog = catalog.filter(
  (item) => sectionForRoute(item.id) === "components",
);

/** One index drives desktop search, mobile search and adjacent component links. */
export const sectionEntries: Record<SiteSection, IndexEntry[]> = {
  components: componentCatalog.map((item) => ({
    name: item.name,
    href: `#${item.id}`,
    group: item.group === "Start here" ? "Foundations" : item.group,
  })),
  pages: catalog
    .filter((item) => item.group === "Concepts")
    .map((item) => ({
      name: item.name,
      href: `#${item.id}`,
      group: "Pages",
    })),
  home: [
    { name: "Overview", href: "#home", group: "On this page" },
    {
      name: "Component library",
      href: "#button",
      group: "On this page",
    },
    { name: "Foundations", href: "#foundations", group: "On this page" },
    { name: "Community", href: "#home/community", group: "On this page" },
    {
      name: "Documentation",
      href: "#documentation",
      group: "On this page",
    },
  ],
  documentation: documentationGuides.map(({ id, name }) => ({
    name,
    href: `#documentation${id ? `/${id}` : ""}`,
    group: "Guides",
  })),
};

export { figmaHref as figmaAccessHref } from "./site-config";
