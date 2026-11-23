import type { LinkProps } from "./Link";

export interface AuthRequestContext {
  signal: AbortSignal;
}
export interface AuthNavigationProps {
  signInHref: string;
  onBackToSignIn?: LinkProps["onClick"];
}
export interface PasswordRecoveryFormProps extends AuthNavigationProps {
  onRequestReset: (
    email: string,
    context: AuthRequestContext,
  ) => void | Promise<void>;
  defaultEmail?: string;
  /** Safe application-owned feedback, never raw provider exceptions. */
  error?: string;
}
export interface RecoveryEmailSentProps extends AuthNavigationProps {
  email: string;
  onResend: (context: AuthRequestContext) => void | Promise<void>;
  changeEmailHref: string;
  onChangeEmail?: LinkProps["onClick"];
  /** UI delay after entering the screen and after a successful resend. Server throttling remains authoritative. */
  resendCooldownSeconds?: number;
  error?: string;
}
export interface ResetPasswordFormProps extends AuthNavigationProps {
  onResetPassword: (
    password: string,
    context: AuthRequestContext,
  ) => void | Promise<void>;
  /** The application validates the reset token; the kit never reads or stores it. */
  tokenStatus?: "valid" | "expired" | "invalid";
  requestResetHref: string;
  onRequestNewLink?: LinkProps["onClick"];
  minimumLength?: number;
  /** Additional client policy; return safe error copy. The server still validates the password. */
  validatePassword?: (password: string) => string | undefined;
  error?: string;
}
export interface TwoStepVerificationFormProps extends AuthNavigationProps {
  /** The application owns the challenge identity, expiry and success navigation. */
  onVerify: (code: string, context: AuthRequestContext) => void | Promise<void>;
  error?: string;
}
