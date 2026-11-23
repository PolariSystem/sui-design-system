import { Fragment, useMemo, type ReactNode } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-tsx";
import "./code.css";
import { ScrollArea, ScrollAreaViewport, ScrollBar } from "../src";

// React owns these nodes; Prism only tokenizes source, never rewrites the DOM.
Prism.manual = true;

function renderTokens(
  tokens: string | Prism.Token | (string | Prism.Token)[],
): ReactNode {
  if (typeof tokens === "string") return tokens;
  if (Array.isArray(tokens))
    return tokens.map((token, index) => (
      <Fragment key={index}>{renderTokens(token)}</Fragment>
    ));
  const aliases = tokens.alias ? [tokens.alias].flat() : [];
  return (
    <span className={["token", tokens.type, ...aliases].join(" ")}>
      {renderTokens(tokens.content)}
    </span>
  );
}

/** Shared TSX preview. Original whitespace and selectable source survive highlighting. */
export function CodeBlock({
  code,
  label = "Usage code example",
  className = "",
}: {
  code: string;
  label?: string;
  className?: string;
}) {
  const highlighted = useMemo(() => {
    const grammar = Prism.languages.tsx;
    const environment = {
      code,
      grammar,
      language: "tsx",
      tokens: Prism.tokenize(code, grammar),
    };
    // JSX's post-tokenization hook distinguishes text children from JS expressions.
    Prism.hooks.run("after-tokenize", environment);
    return renderTokens(environment.tokens);
  }, [code]);
  return (
    <ScrollArea className={`sui-code-scroll ${className}`}>
      <ScrollAreaViewport role="region" aria-label={label}>
        <pre className="sui-code-block">
          <code className="language-tsx">{highlighted}</code>
        </pre>
      </ScrollAreaViewport>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
