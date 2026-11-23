import { useRef, useState, type FormEvent } from "react";
import type { PasswordRecoveryFormProps } from "./Auth.types";
import { Input } from "./Input";
import { Button } from "./Button";
import { CardFooter } from "./Card";
import { AuthBackLink, AuthFeedback } from "./internal/AuthFeedback";
import { useAuthRequest } from "./internal/useAuthRequest";

/** Requests recovery without revealing whether an account exists. Navigation belongs to the application. */
export function PasswordRecoveryForm({
  onRequestReset,
  defaultEmail = "",
  error,
  ...navigation
}: PasswordRecoveryFormProps) {
  const email = useRef<HTMLInputElement>(null);
  const [emailError, setEmailError] = useState<string>();
  const request = useAuthRequest(
    "Unable to request a reset link. Please try again.",
  );
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.pending) return;
    const input = email.current!;
    input.value = input.value.trim();
    const message = !input.value
      ? "Enter your work email."
      : input.validity.typeMismatch
        ? "Enter a valid email address."
        : undefined;
    setEmailError(message);
    if (message) {
      input.focus();
      return;
    }
    void request.run((context) => onRequestReset(input.value, context));
  }
  return (
    <form
      aria-label="Password recovery"
      className="sui-sign-in-form"
      noValidate
      onSubmit={submit}
      aria-busy={request.pending}
    >
      <AuthFeedback
        error={error || request.failure}
        pending={request.pending}
        pendingLabel="Requesting a reset link."
      />
      <Input
        ref={email}
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        aria-required="true"
        placeholder="you@company.com"
        defaultValue={defaultEmail}
        readOnly={request.pending}
        error={emailError}
        onChange={() => {
          setEmailError(undefined);
          request.clearFailure();
        }}
      />
      <CardFooter className="sui-auth-actions">
        <Button
          type="submit"
          size="lg"
          className="sui-auth-submit"
          loading={request.pending}
          loadingLabel="Sending link"
        >
          Send reset link
        </Button>
        <AuthBackLink {...navigation} disabled={request.pending} />
      </CardFooter>
    </form>
  );
}
