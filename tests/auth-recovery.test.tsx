import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import {
  AuthScreen,
  PasswordRecoveryForm,
  RecoveryEmailSent,
  ResetPasswordForm,
  TwoStepVerificationForm,
} from "../src";

afterEach(() => vi.useRealTimers());
const navigation = { signInHref: "/sign-in" };

it("validates recovery addresses and exposes only safe retry feedback", async () => {
  const user = userEvent.setup();
  const request = vi
    .fn()
    .mockRejectedValueOnce(new Error("Private provider detail"))
    .mockResolvedValueOnce(undefined);
  render(<PasswordRecoveryForm {...navigation} onRequestReset={request} />);
  await user.click(screen.getByRole("button", { name: "Send reset link" }));
  expect(screen.getByLabelText("Work email")).toHaveFocus();
  expect(request).not.toHaveBeenCalled();
  await user.type(screen.getByLabelText("Work email"), "team@example.com");
  await user.click(screen.getByRole("button", { name: "Send reset link" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Unable to request a reset link.",
  );
  expect(screen.queryByText("Private provider detail")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Send reset link" }));
  expect(request).toHaveBeenLastCalledWith("team@example.com", {
    signal: expect.any(AbortSignal),
  });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("blocks duplicate recovery requests and aborts work on unmount", async () => {
  const request = vi.fn(() => new Promise<void>(() => {}));
  const { unmount } = render(
    <PasswordRecoveryForm
      {...navigation}
      defaultEmail="team@example.com"
      onRequestReset={request}
    />,
  );
  const form = screen.getByRole("form");
  fireEvent.submit(form);
  fireEvent.submit(form);
  expect(request).toHaveBeenCalledOnce();
  expect(screen.getByLabelText("Work email")).toHaveAttribute("readonly");
  const signal = (
    request.mock.calls[0] as unknown as [string, { signal: AbortSignal }]
  )[1].signal;
  unmount();
  expect(signal.aborted).toBe(true);
});

it("uses wall time for resend cooldown, restarts after success and permits retry after failure", async () => {
  vi.useFakeTimers();
  const resend = vi
    .fn()
    .mockRejectedValueOnce(new Error("Private detail"))
    .mockResolvedValueOnce(undefined);
  render(
    <RecoveryEmailSent
      {...navigation}
      email="team@example.com"
      changeEmailHref="/recover"
      onResend={resend}
      resendCooldownSeconds={30}
    />,
  );
  expect(
    screen.getByRole("button", { name: "Resend email in 30s" }),
  ).toBeDisabled();
  // Background tabs may miss interval ticks; visibility synchronizes against the deadline.
  vi.setSystemTime(Date.now() + 31_000);
  fireEvent(document, new Event("visibilitychange"));
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: /^Resend email$/ })),
  );
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Unable to resend the email.",
  );
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: /^Resend email$/ })),
  );
  expect(
    screen.getByRole("button", { name: "Resend email in 30s" }),
  ).toBeDisabled();
  expect(
    screen.getByText(
      "If an account exists, a new reset link will arrive shortly.",
    ),
  ).toBeInTheDocument();
  expect(resend).toHaveBeenCalledTimes(2);
});

it("cancels resend for a changed address without publishing stale feedback", async () => {
  let finish!: () => void;
  let signal!: AbortSignal;
  const onResend = vi.fn((context: { signal: AbortSignal }) => {
    signal = context.signal;
    return new Promise<void>((resolve) => {
      finish = resolve;
    });
  });
  const props = {
    ...navigation,
    changeEmailHref: "/recover",
    onResend,
    resendCooldownSeconds: 0,
  };
  const { rerender } = render(
    <RecoveryEmailSent {...props} email="first@example.com" />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Resend email" }));
  rerender(<RecoveryEmailSent {...props} email="second@example.com" />);
  expect(signal.aborted).toBe(true);
  await act(async () => finish());
  expect(
    screen.queryByText(
      "If an account exists, a new reset link will arrive shortly.",
    ),
  ).not.toBeInTheDocument();
});

it("validates password policy and confirmation while preserving password whitespace", async () => {
  const user = userEvent.setup();
  const reset = vi.fn();
  render(
    <ResetPasswordForm
      {...navigation}
      requestResetHref="/recover"
      onResetPassword={reset}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Update password" }));
  expect(screen.getByLabelText("New password", { exact: true })).toHaveFocus();
  await user.type(
    screen.getByLabelText("New password", { exact: true }),
    " long passphrase ",
  );
  await user.type(
    screen.getByLabelText("Confirm password", { exact: true }),
    "different",
  );
  await user.click(screen.getByRole("button", { name: "Update password" }));
  expect(
    screen.getByLabelText("Confirm password", { exact: true }),
  ).toHaveFocus();
  expect(reset).not.toHaveBeenCalled();
  await user.clear(screen.getByLabelText("Confirm password", { exact: true }));
  await user.type(
    screen.getByLabelText("Confirm password", { exact: true }),
    " long passphrase ",
  );
  await user.click(screen.getByRole("button", { name: "Update password" }));
  expect(reset).toHaveBeenCalledWith(" long passphrase ", {
    signal: expect.any(AbortSignal),
  });
});

it("invalidates an in-flight reset when its link expires and removes password fields", async () => {
  let signal!: AbortSignal;
  const onResetPassword = (
    _password: string,
    context: { signal: AbortSignal },
  ) => {
    signal = context.signal;
    return new Promise<void>(() => {});
  };
  const props = {
    ...navigation,
    requestResetHref: "/recover",
    onResetPassword,
  };
  const { rerender } = render(<ResetPasswordForm {...props} />);
  fireEvent.change(screen.getByLabelText("New password", { exact: true }), {
    target: { value: "Long passphrase" },
  });
  fireEvent.change(screen.getByLabelText("Confirm password", { exact: true }), {
    target: { value: "Long passphrase" },
  });
  fireEvent.submit(screen.getByRole("form"));
  rerender(<ResetPasswordForm {...props} tokenStatus="expired" />);
  expect(signal.aborted).toBe(true);
  expect(screen.queryByRole("form")).not.toBeInTheDocument();
  expect(screen.getByText("This reset link has expired.")).toBeVisible();
  expect(
    screen.getByRole("link", { name: "Request a new link" }),
  ).toHaveAttribute("href", "/recover");
  rerender(<ResetPasswordForm {...props} tokenStatus="invalid" />);
  expect(screen.getByText("This reset link is invalid.")).toBeVisible();
});

it("requires an explicit verification submit, preserves leading zeros and permits retry", async () => {
  const user = userEvent.setup();
  const verify = vi
    .fn()
    .mockRejectedValueOnce(new Error("Private challenge detail"))
    .mockResolvedValueOnce(undefined);
  render(<TwoStepVerificationForm {...navigation} onVerify={verify} />);
  await user.click(screen.getByRole("button", { name: "Verify and sign in" }));
  expect(screen.getByLabelText("Verification code")).toHaveFocus();
  await user.paste("012345");
  expect(verify).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Verify and sign in" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "Unable to verify this code.",
  );
  await user.click(screen.getByRole("button", { name: "Verify and sign in" }));
  expect(verify).toHaveBeenLastCalledWith("012345", {
    signal: expect.any(AbortSignal),
  });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("preserves the paused leaf across steps, clears fields and focuses the changed heading", () => {
  const { container, rerender } = render(
    <AuthScreen
      screen={{
        step: "reset-password",
        ...navigation,
        requestResetHref: "/recover",
        onResetPassword: vi.fn(),
      }}
    />,
  );
  const leaf = container.querySelector(".sui-auth-leaf");
  fireEvent.click(
    screen.getByRole("button", { name: "Pause background animation" }),
  );
  fireEvent.change(screen.getByLabelText("New password", { exact: true }), {
    target: { value: "Temporary secret" },
  });
  rerender(<AuthScreen screen={{ step: "password-updated", ...navigation }} />);
  expect(container.querySelector(".sui-auth-leaf")).toBe(leaf);
  expect(
    screen.getByRole("button", { name: "Resume background animation" }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Password updated" }),
  ).toHaveFocus();
  expect(
    screen.queryByDisplayValue("Temporary secret"),
  ).not.toBeInTheDocument();
});
