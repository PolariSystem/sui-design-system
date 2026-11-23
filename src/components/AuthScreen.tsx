import { AuthLayout, type AuthLayoutProps } from "./AuthLayout";
import { SignInForm, type SignInFormProps } from "./SignInForm";
import { PasswordRecoveryForm } from "./PasswordRecoveryForm";
import { RecoveryEmailSent } from "./RecoveryEmailSent";
import { ResetPasswordForm } from "./ResetPasswordForm";
import { TwoStepVerificationForm } from "./TwoStepVerificationForm";
import { AuthBackLink } from "./internal/AuthFeedback";
import type {
  AuthNavigationProps,
  PasswordRecoveryFormProps,
  RecoveryEmailSentProps,
  ResetPasswordFormProps,
  TwoStepVerificationFormProps,
} from "./Auth.types";
import shield from "../assets/auth-shield-check.svg";

/** Each step requires its own integration contract; no credentials or tokens enter the step model. */
export type AuthScreenState =
  | ({ step: "sign-in" } & SignInFormProps)
  | ({ step: "forgot-password" } & PasswordRecoveryFormProps)
  | ({ step: "check-inbox" } & RecoveryEmailSentProps)
  | ({ step: "reset-password" } & ResetPasswordFormProps)
  | ({ step: "password-updated" } & AuthNavigationProps)
  | ({ step: "verify" } & TwoStepVerificationFormProps);
export interface AuthScreenProps extends Omit<
  AuthLayoutProps,
  "children" | "title" | "description" | "footer" | "headingIcon"
> {
  screen: AuthScreenState;
}
const headings = {
  "sign-in": ["Welcome back", "Sign in to your workspace."],
  "forgot-password": [
    "Forgot your password?",
    "Enter your work email and we’ll send you a reset link.",
  ],
  "check-inbox": ["Check your inbox", ""],
  "reset-password": [
    "Set a new password",
    "Choose a strong password you haven’t used before.",
  ],
  "password-updated": [
    "Password updated",
    "You can now sign in with your new password.",
  ],
  verify: [
    "Verify it’s you",
    "Enter the 6-digit code from your authenticator app.",
  ],
} as const;

/** Controlled access composition. Keep this component mounted as steps change to preserve leaf motion. */
export function AuthScreen({ screen, ...layout }: AuthScreenProps) {
  let content;
  switch (screen.step) {
    case "sign-in":
      content = <SignInForm {...screen} />;
      break;
    case "forgot-password":
      content = <PasswordRecoveryForm {...screen} />;
      break;
    case "check-inbox":
      content = <RecoveryEmailSent {...screen} />;
      break;
    case "reset-password":
      content = <ResetPasswordForm {...screen} />;
      break;
    case "password-updated":
      content = <AuthBackLink {...screen} primary />;
      break;
    case "verify":
      content = <TwoStepVerificationForm {...screen} />;
      break;
  }
  const [title, description] = headings[screen.step];
  return (
    <AuthLayout
      {...layout}
      focusHeadingOnChange={layout.focusHeadingOnChange ?? true}
      title={title}
      description={
        screen.step === "check-inbox"
          ? `If an account exists for ${screen.email}, you’ll receive a password reset link.`
          : description
      }
      headingIcon={
        screen.step === "password-updated" ? (
          <img src={shield} alt="" />
        ) : undefined
      }
      footer={
        screen.step === "sign-in"
          ? "Need access? Contact your administrator."
          : screen.step === "verify"
            ? "Can’t access your authenticator? Contact your administrator."
            : undefined
      }
    >
      {content}
    </AuthLayout>
  );
}
