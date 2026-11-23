import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { AuthLayout, SignInForm } from "../src";

it("validates credentials, focuses the first error and never invokes the provider for invalid input", async () => {
  const user = userEvent.setup();
  const signIn = vi.fn();
  render(<SignInForm onSignIn={signIn} forgotPasswordHref="/recover" />);
  await user.click(screen.getByRole("button", { name: "Sign in" }));
  expect(screen.getByLabelText("Work email")).toHaveFocus();
  expect(screen.getByLabelText("Work email")).toHaveAccessibleDescription(
    "Enter your work email.",
  );
  await user.type(screen.getByLabelText("Work email"), "invalid");
  await user.click(screen.getByRole("button", { name: "Sign in" }));
  expect(screen.getByText("Enter a valid email address.")).toBeVisible();
  expect(signIn).not.toHaveBeenCalled();
});

it("submits one request with unchanged password whitespace and native remember preference", async () => {
  const user = userEvent.setup();
  let complete!: () => void;
  const signIn = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        complete = resolve;
      }),
  );
  render(
    <SignInForm
      onSignIn={signIn}
      forgotPasswordHref="/recover"
      defaultEmail="team@example.com"
    />,
  );
  await user.type(
    screen.getByLabelText("Password", { exact: true }),
    " my password ",
  );
  await user.click(screen.getByLabelText("Remember me"));
  await user.click(screen.getByRole("button", { name: "Sign in" }));
  fireEvent.submit(screen.getByRole("form", { name: "Sign in" }));
  expect(signIn).toHaveBeenCalledOnce();
  expect(signIn.mock.calls[0]).toEqual([
    { email: "team@example.com", password: " my password ", rememberMe: false },
    { signal: expect.any(AbortSignal) },
  ]);
  expect(screen.getByLabelText("Work email")).toHaveAttribute("readonly");
  expect(screen.getByRole("button", { name: "Signing in" })).toBeDisabled();
  await act(async () => complete());
  expect(screen.getByRole("button", { name: "Sign in" })).toBeEnabled();
});

it("keeps provider failures generic, preserves input and permits retry", async () => {
  const user = userEvent.setup();
  const signIn = vi
    .fn()
    .mockRejectedValueOnce(new Error("Private backend detail"))
    .mockResolvedValueOnce(undefined);
  render(
    <SignInForm
      onSignIn={signIn}
      forgotPasswordHref="/recover"
      defaultEmail="team@example.com"
    />,
  );
  await user.type(screen.getByLabelText("Password", { exact: true }), "secret");
  await user.click(screen.getByRole("button", { name: "Show password" }));
  expect(screen.getByLabelText("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await user.click(screen.getByRole("button", { name: "Sign in" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Unable to sign in.");
  expect(screen.queryByText("Private backend detail")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Password", { exact: true })).toHaveValue(
    "secret",
  );
  await user.click(screen.getByRole("button", { name: "Sign in" }));
  expect(signIn).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(
    screen.getByRole("link", { name: "Forgot password?" }),
  ).toHaveAttribute("href", "/recover");
});

it("aborts pending integration work when the form unmounts", async () => {
  const user = userEvent.setup();
  let signal!: AbortSignal;
  const { unmount } = render(
    <SignInForm
      onSignIn={(_, context) => {
        signal = context.signal;
        return new Promise(() => {});
      }}
      forgotPasswordHref="/recover"
      defaultEmail="team@example.com"
    />,
  );
  await user.type(screen.getByLabelText("Password", { exact: true }), "secret");
  await user.click(screen.getByRole("button", { name: "Sign in" }));
  unmount();
  expect(signal.aborted).toBe(true);
});

it("scopes SVG fragments per auth composition without changing source paths", () => {
  const { container } = render(
    <>
      <AuthLayout title="First">
        <p>Content</p>
      </AuthLayout>
      <AuthLayout title="Second">
        <p>Content</p>
      </AuthLayout>
    </>,
  );
  const ids = [...container.querySelectorAll("[id]")].map((node) => node.id);
  expect(new Set(ids).size).toBe(ids.length);
  for (const use of container.querySelectorAll("use")) {
    expect(ids).toContain(use.getAttribute("href")!.slice(1));
  }
  expect(container.querySelectorAll('path[pathLength="1"]')).toHaveLength(4);
});
