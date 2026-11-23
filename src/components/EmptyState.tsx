import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { Card } from "./Card";
import folder from "../assets/empty-folder.svg";
import {
  EmptyStateIllustration,
  type EmptyStateIllustrationName,
} from "./EmptyStateIllustration";

export interface EmptyStateProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "title"
> {
  title: string;
  description: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  /** Subtle presentation shares the surrounding surface without a nested card. */
  variant?: "card" | "subtle";
  /** A full illustration takes precedence over the small icon slot. */
  illustration?: EmptyStateIllustrationName;
  headingLevel?: 2 | 3 | 4;
}

/** Empty and no-results states share a surface; applications supply accurate wording and recovery. */
export function EmptyState({
  title,
  description,
  action,
  icon = <img src={folder} alt="" />,
  variant = "card",
  illustration,
  headingLevel = 3,
  className = "",
  ...props
}: EmptyStateProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  const Surface = variant === "card" ? Card : "div";
  return (
    <Surface
      {...props}
      {...(variant === "card" ? { padding: "comfortable" as const } : {})}
      className={`sui-empty-state flex min-w-0 flex-col items-center justify-center text-center font-sui text-sui-text-primary ${variant === "subtle" ? "gap-2 p-4" : "gap-5"} ${className}`}
    >
      {illustration ? (
        <EmptyStateIllustration name={illustration} />
      ) : (
        <span
          aria-hidden="true"
          className="inline-flex size-8 shrink-0 items-center justify-center"
        >
          {icon}
        </span>
      )}
      <Heading
        className={
          variant === "subtle" ? "text-sui-heading-xs" : "text-sui-heading-sm"
        }
      >
        {title}
      </Heading>
      {description != null && (
        <div className="w-full min-w-0 text-sui-body-sm text-sui-text-secondary">
          {description}
        </div>
      )}
      {action && (
        <div className="flex w-full flex-wrap justify-end gap-2">{action}</div>
      )}
    </Surface>
  );
}
