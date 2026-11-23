import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button } from "./Button";
import { Card } from "./Card";
import { SerenityLeaf } from "./internal/SerenityLeaf";
import brandLeaf from "../assets/auth-brand-leaf.svg";
import brandWordmark from "../assets/auth-brand-wordmark.svg";
import whiteLeaf from "../assets/brand-white-leaf.svg";
import whiteWordmark from "../assets/brand-white-wordmark.svg";

export interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  footer?: ReactNode;
  /** Replace the default Serenity brand with an accessible product logo. */
  brand?: ReactNode;
  headingLevel?: 1 | 2 | 3;
  /** Decorative indicator above the title, such as the approved success shield. */
  headingIcon?: ReactNode;
  /** Focus changed step headings without moving focus on initial page load. */
  focusHeadingOnChange?: boolean;
  /** False renders a static leaf. OS reduced-motion preferences always take priority. */
  animated?: boolean;
  className?: string;
}

/** Centered access composition; the card grows with errors, translations and enlarged text. */
export function AuthLayout({
  children,
  title,
  description,
  footer,
  brand,
  headingLevel = 1,
  headingIcon,
  focusHeadingOnChange = false,
  animated = true,
  className = "",
}: AuthLayoutProps) {
  const titleId = useId();
  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3";
  const [paused, setPaused] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousTitle = useRef(title);
  useEffect(() => {
    if (focusHeadingOnChange && previousTitle.current !== title)
      heading.current?.focus({ preventScroll: true });
    previousTitle.current = title;
  }, [title, focusHeadingOnChange]);
  return (
    <section
      aria-labelledby={titleId}
      className={`sui-auth-layout font-sui ${className}`}
    >
      <div className="sui-auth-background" aria-hidden="true">
        <SerenityLeaf animated={animated} paused={paused} />
        <div className="sui-auth-frost" />
      </div>
      <Card className="sui-auth-card" padding="comfortable">
        <div className="sui-auth-brand">
          {brand ?? (
            <div role="img" aria-label="Serenity" className="sui-auth-logo">
              <img
                src={brandLeaf}
                alt=""
                className="sui-auth-logo-leaf sui-brand-light"
              />
              <img
                src={brandWordmark}
                alt=""
                className="sui-auth-logo-wordmark sui-brand-light"
              />
              <img
                src={whiteLeaf}
                alt=""
                className="sui-auth-logo-leaf sui-brand-dark"
                width={32.5355}
                height={51.2}
              />
              <img
                src={whiteWordmark}
                alt=""
                className="sui-auth-logo-wordmark sui-brand-dark"
                width={98.9232}
                height={29.084}
              />
            </div>
          )}
        </div>
        <header className="flex flex-col gap-2 text-center">
          {headingIcon && (
            <div className="flex justify-center" aria-hidden="true">
              {headingIcon}
            </div>
          )}
          <Heading
            ref={heading}
            tabIndex={-1}
            id={titleId}
            className="sui-auth-title"
          >
            {title}
          </Heading>
          {description && (
            <p className="text-sui-body-md text-sui-text-muted">
              {description}
            </p>
          )}
        </header>
        {children}
        {footer && (
          <div className="text-center text-sui-caption-md text-sui-text-muted">
            {footer}
          </div>
        )}
      </Card>
      {animated && (
        <Button
          className="sui-auth-motion-control"
          variant="tertiary"
          size="sm"
          onClick={() => setPaused((current) => !current)}
        >
          {paused
            ? "Resume background animation"
            : "Pause background animation"}
        </Button>
      )}
    </section>
  );
}
