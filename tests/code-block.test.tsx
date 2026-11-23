import { render, screen } from "@testing-library/react";
import { beforeAll, afterAll, expect, it, vi } from "vitest";
import { CodeBlock } from "../workshop/CodeBlock";

// jsdom has no layout engine. Browser tests verify actual scrolling and measurement.
beforeAll(() =>
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  ),
);
afterAll(() => vi.unstubAllGlobals());

it("preserves TSX source and whitespace without interpreting example markup", () => {
  const code = `// Keep this comment\nconst label = "<script>not executable</script>";\n<Button disabled={false} count={12}>\n  {label}\n</Button>`;
  const { container, rerender } = render(<CodeBlock code={code} />);
  expect(screen.getByRole("region").textContent).toBe(code);
  expect(container.querySelector("script, button")).toBeNull();
  for (const token of [
    "comment",
    "keyword",
    "string",
    "boolean",
    "number",
    "tag",
    "attr-name",
  ])
    expect(container.querySelector(`.token.${token}`)).not.toBeNull();
  rerender(<CodeBlock code={'<Input label="Name" />'} />);
  expect(screen.getByRole("region").textContent).toBe('<Input label="Name" />');
});
