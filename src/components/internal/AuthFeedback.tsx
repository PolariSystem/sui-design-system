import { Alert } from "../Alert";
import { Link, type LinkProps } from "../Link";
import type { AuthNavigationProps } from "../Auth.types";

export function AuthFeedback({
  error,
  pending,
  pendingLabel,
}: {
  error?: string;
  pending: boolean;
  pendingLabel: string;
}) {
  return (
    <>
      {error && <Alert title={error} tone="danger" announcement="assertive" />}
      <span role="status" className="sr-only">
        {pending ? pendingLabel : ""}
      </span>
    </>
  );
}
/** Navigation keeps anchor semantics while matching the approved full-width action geometry. */
export function AuthActionLink({
  primary = false,
  className = "",
  ...props
}: LinkProps & { primary?: boolean }) {
  return (
    <Link
      {...props}
      className={`sui-auth-action-link ${primary ? "sui-auth-action-link-primary" : ""} ${className}`}
    />
  );
}
export function AuthBackLink({
  signInHref,
  onBackToSignIn,
  disabled,
  primary,
}: AuthNavigationProps & { disabled?: boolean; primary?: boolean }) {
  return (
    <AuthActionLink
      href={signInHref}
      onClick={onBackToSignIn}
      disabled={disabled}
      primary={primary}
    >
      Back to sign in
    </AuthActionLink>
  );
}
