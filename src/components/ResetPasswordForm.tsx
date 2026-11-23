import { useId, useRef, useState, type FormEvent } from "react";
import type { ResetPasswordFormProps } from "./Auth.types";
import { Alert } from "./Alert";
import { Button } from "./Button";
import { CardFooter } from "./Card";
import { PasswordInput } from "./PasswordInput";
import {
  AuthActionLink,
  AuthBackLink,
  AuthFeedback,
} from "./internal/AuthFeedback";
import { useAuthRequest } from "./internal/useAuthRequest";
import eye from "../assets/auth-password-eye.svg";

/** Applies the displayed client policy; token validity and password acceptance belong to the server. */
export function ResetPasswordForm({
  onResetPassword,
  tokenStatus = "valid",
  requestResetHref,
  onRequestNewLink,
  minimumLength = 12,
  validatePassword,
  error,
  ...navigation
}: ResetPasswordFormProps) {
  if (!Number.isInteger(minimumLength) || minimumLength < 1)
    throw new Error("minimumLength must be a positive integer.");
  const password = useRef<HTMLInputElement>(null);
  const confirmation = useRef<HTMLInputElement>(null);
  const guidanceId = useId();
  const [errors, setErrors] = useState<{
    password?: string;
    confirmation?: string;
  }>({});
  const request = useAuthRequest(
    "Unable to update your password. Please try again or request a new link.",
    tokenStatus,
  );
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.pending || tokenStatus !== "valid") return;
    const value = password.current!.value;
    const next = {
      password:
        Array.from(value).length < minimumLength
          ? `Use at least ${minimumLength} characters.`
          : validatePassword?.(value),
      confirmation: !confirmation.current!.value
        ? "Confirm your new password."
        : confirmation.current!.value !== value
          ? "Passwords do not match."
          : undefined,
    };
    setErrors(next);
    if (next.password || next.confirmation) {
      (next.password ? password : confirmation).current!.focus();
      return;
    }
    void request.run((context) => onResetPassword(value, context));
  }
  if (tokenStatus !== "valid")
    return (
      <div className="sui-sign-in-form">
        <Alert
          title={
            tokenStatus === "expired"
              ? "This reset link has expired."
              : "This reset link is invalid."
          }
          tone="warning"
        >
          Request a new link to continue.
        </Alert>
        <CardFooter className="sui-auth-actions">
          <AuthActionLink
            href={requestResetHref}
            onClick={onRequestNewLink}
            primary
          >
            Request a new link
          </AuthActionLink>
          <AuthBackLink {...navigation} />
        </CardFooter>
      </div>
    );
  return (
    <form
      aria-label="Set a new password"
      className="sui-sign-in-form"
      noValidate
      onSubmit={submit}
      aria-busy={request.pending}
    >
      <AuthFeedback
        error={error || request.failure}
        pending={request.pending}
        pendingLabel="Updating your password."
      />
      <PasswordInput
        ref={password}
        label="New password"
        name="newPassword"
        autoComplete="new-password"
        placeholder="Enter a new password"
        aria-required="true"
        aria-describedby={guidanceId}
        visibilityIcon={<img src={eye} alt="" />}
        readOnly={request.pending}
        error={errors.password}
        onChange={() => {
          setErrors({});
          request.clearFailure();
        }}
      />
      <PasswordInput
        ref={confirmation}
        label="Confirm password"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        aria-required="true"
        visibilityIcon={<img src={eye} alt="" />}
        readOnly={request.pending}
        error={errors.confirmation}
        onChange={() => {
          setErrors((current) => ({ ...current, confirmation: undefined }));
          request.clearFailure();
        }}
      />
      <p id={guidanceId} className="text-sui-caption-md text-sui-text-muted">
        Use at least {minimumLength} characters. A longer passphrase works well.
      </p>
      <CardFooter className="sui-auth-actions">
        <Button
          type="submit"
          size="lg"
          className="sui-auth-submit"
          loading={request.pending}
          loadingLabel="Updating password"
        >
          Update password
        </Button>
        <AuthBackLink {...navigation} disabled={request.pending} />
      </CardFooter>
    </form>
  );
}
