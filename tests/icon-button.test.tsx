import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { IconButton } from "../src";

it("keeps the action name and ref while blocking disabled and pending activation", async () => {
  const ref = createRef<HTMLButtonElement>();
  const action = vi.fn();
  const props = {
    "aria-label": "Open record actions",
    icon: <svg role="img" aria-label="Decorative dots" />,
    onClick: action,
    ref,
  };
  const { rerender } = render(<IconButton {...props} />);
  const button = screen.getByRole("button", { name: "Open record actions" });
  expect(ref.current).toBe(button);
  expect(button).toHaveAttribute("type", "button");
  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  button.focus();
  await userEvent.keyboard("{Enter}");
  expect(action).toHaveBeenCalledTimes(1);
  rerender(<IconButton {...props} disabled />);
  await userEvent.click(button);
  rerender(<IconButton {...props} loading />);
  expect(button).toHaveAccessibleName("Open record actions");
  expect(button).toHaveAttribute("aria-busy", "true");
  expect(button).toBeDisabled();
  await userEvent.click(button);
  expect(action).toHaveBeenCalledTimes(1);
  rerender(<IconButton {...props} />);
  expect(button).not.toBeDisabled();
  expect(button).not.toHaveAttribute("aria-busy");
});
