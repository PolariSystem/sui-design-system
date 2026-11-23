import { useState, type MouseEvent } from "react";
import {
  Alert,
  AuthScreen,
  Button,
  Link,
  Select,
  type AuthScreenState,
} from "../src";
import { Section } from "./components";

type AuthStep = AuthScreenState["step"];
const steps: { value: AuthStep; label: string }[] = [
  { value: "sign-in", label: "Sign in" },
  { value: "forgot-password", label: "Forgot password" },
  { value: "check-inbox", label: "Check inbox" },
  { value: "reset-password", label: "Set new password" },
  { value: "password-updated", label: "Password updated" },
  { value: "verify", label: "Two-step verification" },
];
function initialStep(): AuthStep {
  const requested = new URLSearchParams(location.search).get("step");
  return steps.find(({ value }) => value === requested)?.value ?? "sign-in";
}

/** Preview-only delay: no credentials are transmitted, logged or stored. */
function waitForPreview(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, 1200);
    if (signal.aborted) abort();
    else signal.addEventListener("abort", abort, { once: true });
  });
}

export function SignInPreview({
  standalone = false,
}: {
  standalone?: boolean;
}) {
  const [step, setStep] = useState<AuthStep>(initialStep);
  const [outcome, setOutcome] = useState("success");
  const [status, setStatus] = useState("");
  const [email, setEmail] = useState("team@example.com");
  const [tokenStatus, setTokenStatus] = useState<
    "valid" | "expired" | "invalid"
  >("valid");
  function navigate(next: AuthStep) {
    setStatus("");
    setStep(next);
  }
  // Preserve native open-in-new-tab behavior; ordinary activation updates the mounted composition.
  const linkTo = (next: AuthStep) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    navigate(next);
  };
  async function respond(signal: AbortSignal) {
    await waitForPreview(signal);
    if (outcome === "error") throw new Error("Preview rejection");
  }
  const navigation = {
    signInHref: "?preview=signin",
    onBackToSignIn: linkTo("sign-in"),
  };
  let screen: AuthScreenState;
  switch (step) {
    case "sign-in":
      screen = {
        step,
        forgotPasswordHref: "?preview=signin&step=forgot-password",
        onForgotPassword: linkTo("forgot-password"),
        onSignIn: async (_values, { signal }) => {
          setStatus("");
          await respond(signal);
          if (signal.aborted) return;
          if (outcome === "verify") navigate("verify");
          else setStatus("Preview complete. No sign-in request was sent.");
        },
      };
      break;
    case "forgot-password":
      screen = {
        step,
        ...navigation,
        defaultEmail: email,
        onRequestReset: async (address, { signal }) => {
          await respond(signal);
          if (signal.aborted) return;
          setEmail(address);
          navigate("check-inbox");
        },
      };
      break;
    case "check-inbox":
      screen = {
        step,
        ...navigation,
        email,
        changeEmailHref: "?preview=signin&step=forgot-password",
        onChangeEmail: linkTo("forgot-password"),
        onResend: ({ signal }) => respond(signal),
      };
      break;
    case "reset-password":
      screen = {
        step,
        ...navigation,
        tokenStatus,
        requestResetHref: "?preview=signin&step=forgot-password",
        onRequestNewLink: linkTo("forgot-password"),
        onResetPassword: async (_password, { signal }) => {
          await respond(signal);
          if (!signal.aborted) navigate("password-updated");
        },
      };
      break;
    case "password-updated":
      screen = { step, ...navigation };
      break;
    case "verify":
      screen = {
        step,
        ...navigation,
        onVerify: async (_code, { signal }) => {
          await respond(signal);
          if (!signal.aborted)
            setStatus("Preview complete. No verification request was sent.");
        },
      };
      break;
  }
  return (
    <>
      {!standalone && (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <Select
            label="Preview screen"
            value={step}
            onValueChange={(value) => navigate(value as AuthStep)}
          >
            {steps.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            label="Preview result"
            value={outcome}
            onValueChange={setOutcome}
          >
            <option value="success">Successful response</option>
            <option value="error">Rejected response</option>
            <option value="verify">Require verification</option>
          </Select>
          {step === "reset-password" && (
            <Select
              label="Reset link status"
              value={tokenStatus}
              onValueChange={(value) =>
                setTokenStatus(value as typeof tokenStatus)
              }
            >
              <option value="valid">Valid link</option>
              <option value="expired">Expired link</option>
              <option value="invalid">Invalid link</option>
            </Select>
          )}
          <Link href={"?preview=signin&step=" + step}>
            Open full-page preview
          </Link>
        </div>
      )}
      {status && (
        <Alert
          title={status}
          tone="success"
          announcement="polite"
          className="mb-4"
        />
      )}
      <AuthScreen
        screen={screen}
        headingLevel={standalone ? 1 : 3}
        className={standalone ? "sui-auth-standalone" : "rounded-sui-lg"}
      />
      {step === "check-inbox" && (
        <div className="flex flex-wrap items-center justify-end gap-2 p-4">
          <p className="text-sui-body-sm text-sui-text-secondary">
            Demo only: no email was sent. Simulate opening the received link.
          </p>
          <Button
            variant="secondary"
            onClick={() => {
              setTokenStatus("valid");
              navigate("reset-password");
            }}
          >
            Open demo reset link
          </Button>
        </div>
      )}
    </>
  );
}

export function Authentication() {
  return (
    <Section
      name="SignInForm"
      description="Access compositions · Sign-in, password recovery and authenticator verification with a shared animated background."
    >
      <SignInPreview />
      <div
        id="signin-integration"
        className="mt-4 flex flex-col gap-2 rounded-sui-lg border border-sui-border-default p-4"
      >
        <h3 className="text-sui-heading-xs">
          Connect your authentication service
        </h3>
        <p className="text-sui-body-md text-sui-text-secondary">
          These previews run locally. Your application owns authentication,
          reset tokens, email delivery, challenge expiry, throttling and success
          navigation. Keep AuthScreen mounted when changing steps to preserve
          the background animation. Each form also works independently.
        </p>
      </div>
    </Section>
  );
}
