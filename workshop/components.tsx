import { repositoryHref } from "./site-config";
import type { ReactNode } from "react";
import { useWorkshopRoute } from "./route-context";

/** Groups variants without adding a decorative card around the component itself. */
export function Specimen({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-4">{children}</div>;
}

export function Example({ children }: { children: ReactNode }) {
  return (
    <div className="min-w-0">
      <hr className="my-4 border-0 border-t border-sui-border-default" />
      <h2 className="mb-4 text-sui-label-md text-sui-text-secondary">
        Usage example
      </h2>
      {children}
    </div>
  );
}

export function Section({
  name,
  description,
  children,
}: {
  name: string;
  description: string;
  children: ReactNode;
}) {
  const route = useWorkshopRoute();
  // Unselected examples never mount, so hidden demos cannot run timers or trap focus.
  if (route !== name.toLowerCase()) return null;
  return (
    <section
      id={name.toLowerCase()}
      aria-labelledby={`${name}-title`}
      className="workshop-section"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 id={`${name}-title`} className="text-sui-heading-xl">
            {name}
          </h1>
          <p className="mt-1 text-sui-body-md text-sui-text-secondary">
            {description}
          </p>
        </div>
        <a
          className="docs-text-link"
          href={`${repositoryHref}/tree/main/src`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View source on GitHub ↗
        </a>
      </div>
      {children}
    </section>
  );
}
