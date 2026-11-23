import { useRef, useState, type FormEvent } from "react";
import type { TwoStepVerificationFormProps } from "./Auth.types";
import { OTPInput } from "./OTPInput";
import { Button } from "./Button";
import { CardFooter } from "./Card";
import { AuthBackLink, AuthFeedback } from "./internal/AuthFeedback";
import { useAuthRequest } from "./internal/useAuthRequest";

/** A six-digit authenticator challenge. Completing or pasting the code never submits automatically. */
export function TwoStepVerificationForm({
  onVerify,
  error,
  ...navigation
}: TwoStepVerificationFormProps) {
  const input = useRef<HTMLInputElement>(null);
  const [codeError, setCodeError] = useState<string>();
  const request = useAuthRequest(
    "Unable to verify this code. Try the current code from your authenticator app.",
  );
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.pending) return;
    if (!/^[0-9]{6}$/.test(input.current!.value)) {
      setCodeError("Enter all six digits.");
      input.current!.focus();
      return;
    }
    setCodeError(undefined);
    void request.run((context) => onVerify(input.current!.value, context));
  }
  return (
    <form
      aria-label="Two-step verification"
      className="sui-sign-in-form"
      noValidate
      onSubmit={submit}
      aria-busy={request.pending}
    >
      <AuthFeedback
        error={error || request.failure}
        pending={request.pending}
        pendingLabel="Verifying your code."
      />
      <OTPInput
        ref={input}
        label="Verification code"
        name="code"
        aria-required="true"
        readOnly={request.pending}
        error={codeError}
        onValueChange={() => {
          setCodeError(undefined);
          request.clearFailure();
        }}
      />
      <CardFooter className="sui-auth-actions">
        <Button
          type="submit"
          size="lg"
          className="sui-auth-submit"
          loading={request.pending}
          loadingLabel="Verifying code"
        >
          Verify and sign in
        </Button>
        <AuthBackLink {...navigation} disabled={request.pending} />
      </CardFooter>
    </form>
  );
}
