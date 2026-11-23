import { useEffect, useRef, useState } from "react";
import type { RecoveryEmailSentProps } from "./Auth.types";
import { Button } from "./Button";
import { Link } from "./Link";
import { CardFooter } from "./Card";
import { AuthBackLink, AuthFeedback } from "./internal/AuthFeedback";
import { useAuthRequest } from "./internal/useAuthRequest";

/** Inbox guidance and resend action. The timer is a UI affordance, never a rate-limit boundary. */
export function RecoveryEmailSent(props: RecoveryEmailSentProps) {
  // A changed destination starts a new cooldown and cancels work for the previous address.
  return <RecoveryEmailSentContent key={props.email} {...props} />;
}
function RecoveryEmailSentContent({
  onResend,
  changeEmailHref,
  onChangeEmail,
  resendCooldownSeconds = 30,
  error,
  ...navigation
}: RecoveryEmailSentProps) {
  if (!Number.isFinite(resendCooldownSeconds) || resendCooldownSeconds < 0)
    throw new Error(
      "resendCooldownSeconds must be a finite nonnegative number.",
    );
  const request = useAuthRequest(
    "Unable to resend the email. Please try again.",
  );
  const deadline = useRef(Date.now() + resendCooldownSeconds * 1000);
  const [remaining, setRemaining] = useState(Math.ceil(resendCooldownSeconds));
  const [notice, setNotice] = useState("");
  useEffect(() => {
    // Recalculate against wall time after tab suspension rather than decrementing stale ticks.
    const update = () =>
      setRemaining(
        Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)),
      );
    const timer = setInterval(update, 1000);
    document.addEventListener("visibilitychange", update);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  async function resend() {
    if (Date.now() < deadline.current) return;
    setNotice("");
    if (await request.run(onResend)) {
      deadline.current = Date.now() + resendCooldownSeconds * 1000;
      setRemaining(Math.ceil(resendCooldownSeconds));
      setNotice("If an account exists, a new reset link will arrive shortly.");
    }
  }
  return (
    <div className="sui-auth-confirmation" aria-busy={request.pending}>
      <AuthFeedback
        error={error || request.failure}
        pending={request.pending}
        pendingLabel="Requesting another reset link."
      />
      <div className="sui-auth-guidance">
        <p className="text-sui-label-lg">Can’t find the email?</p>
        <p className="text-sui-body-sm text-sui-text-muted">
          Check your spam folder or request a new link.
        </p>
      </div>
      <CardFooter className="sui-auth-actions">
        <AuthBackLink {...navigation} primary disabled={request.pending} />
        <Button
          variant="secondary"
          size="lg"
          className="sui-auth-submit"
          disabled={remaining > 0}
          loading={request.pending}
          loadingLabel="Resending email"
          onClick={() => void resend()}
        >
          {remaining > 0 ? `Resend email in ${remaining}s` : "Resend email"}
        </Button>
      </CardFooter>
      <Link
        href={changeEmailHref}
        onClick={onChangeEmail}
        disabled={request.pending}
        className="justify-center"
      >
        Use a different email
      </Link>
      {/* Announce successful requests once, not every countdown tick. */}
      <span role="status" className="sr-only">
        {notice}
      </span>
    </div>
  );
}
