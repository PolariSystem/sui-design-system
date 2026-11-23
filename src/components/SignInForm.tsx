import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Alert } from "./Alert";
import { Button } from "./Button";
import { CardFooter } from "./Card";
import { Checkbox } from "./Checkbox";
import { Input } from "./Input";
import { Link, type LinkProps } from "./Link";
import { PasswordInput } from "./PasswordInput";
import eye from "../assets/auth-password-eye.svg";

export interface SignInValues {
  email: string;
  password: string;
  rememberMe: boolean;
}
export interface SignInFormProps {
  /** Resolve after the application handles the result; reject to show a generic retry message.
   * Never persist credentials here. The application owns sessions, MFA and navigation. */
  onSignIn: (
    values: SignInValues,
    context: { signal: AbortSignal },
  ) => void | Promise<void>;
  forgotPasswordHref: string;
  onForgotPassword?: LinkProps["onClick"];
  defaultEmail?: string;
  defaultRememberMe?: boolean;
  /** Safe, user-facing provider feedback. Do not pass raw server exceptions. */
  error?: string;
  className?: string;
}
type FieldErrors = { email?: string; password?: string };

/** Native credential fields with password-manager hints, accessible validation and single-flight submit. */
export function SignInForm({
  onSignIn,
  forgotPasswordHref,
  onForgotPassword,
  defaultEmail = "",
  defaultRememberMe = true,
  error,
  className = "",
}: SignInFormProps) {
  const email = useRef<HTMLInputElement>(null);
  const password = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState("");
  const statusId = useId();
  useEffect(
    () => () => {
      request.current?.abort();
      request.current = null;
    },
    [],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (request.current) return;
    const form = event.currentTarget;
    const emailInput = email.current!;
    const passwordInput = password.current!;
    emailInput.value = emailInput.value.trim();
    const next: FieldErrors = {};
    if (!emailInput.value) next.email = "Enter your work email.";
    else if (emailInput.validity.typeMismatch)
      next.email = "Enter a valid email address.";
    // Sign-in accepts existing passwords without applying a new-password policy or trimming them.
    if (!passwordInput.value) next.password = "Enter your password.";
    setErrors(next);
    setFailure("");
    if (next.email || next.password) {
      (next.email ? emailInput : passwordInput).focus();
      return;
    }
    const controller = new AbortController();
    request.current = controller;
    const values: SignInValues = {
      email: emailInput.value,
      password: passwordInput.value,
      rememberMe: new FormData(form).get("rememberMe") === "on",
    };
    setPending(true);
    try {
      await onSignIn(values, { signal: controller.signal });
    } catch {
      // Provider details can reveal account existence. Keep unexpected failures generic.
      if (!controller.signal.aborted)
        setFailure("Unable to sign in. Check your details and try again.");
    } finally {
      if (!controller.signal.aborted) {
        request.current = null;
        setPending(false);
      }
    }
  }

  return (
    <form
      className={`sui-sign-in-form ${className}`}
      aria-label="Sign in"
      noValidate
      onSubmit={submit}
      aria-busy={pending}
      aria-describedby={statusId}
    >
      {(error || failure) && (
        <Alert
          tone="danger"
          title={error || failure}
          announcement="assertive"
        />
      )}
      <Input
        ref={email}
        label="Work email"
        name="email"
        type="email"
        autoComplete="username"
        inputMode="email"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="you@company.com"
        defaultValue={defaultEmail}
        aria-required="true"
        error={errors.email}
        readOnly={pending}
        onChange={() => {
          setErrors((current) => ({ ...current, email: undefined }));
          setFailure("");
        }}
      />
      <PasswordInput
        ref={password}
        label="Password"
        name="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        aria-required="true"
        visibilityIcon={<img src={eye} alt="" />}
        error={errors.password}
        readOnly={pending}
        onChange={() => {
          setErrors((current) => ({ ...current, password: undefined }));
          setFailure("");
        }}
      />
      <div className="sui-auth-options">
        <Checkbox
          label="Remember me"
          name="rememberMe"
          defaultChecked={defaultRememberMe}
          disabled={pending}
        />
        <Link
          href={forgotPasswordHref}
          onClick={onForgotPassword}
          disabled={pending}
        >
          Forgot password?
        </Link>
      </div>
      <CardFooter>
        <Button
          type="submit"
          size="lg"
          className="sui-auth-submit"
          loading={pending}
          loadingLabel="Signing in"
        >
          Sign in
        </Button>
      </CardFooter>
      <span id={statusId} role="status" className="sr-only">
        {pending ? "Signing in. Please wait." : ""}
      </span>
    </form>
  );
}
