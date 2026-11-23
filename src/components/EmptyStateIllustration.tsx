import error from "../assets/empty-error.svg";
import search from "../assets/empty-search.svg";
import wallet from "../assets/empty-wallet.svg";
import cardError from "../assets/empty-card-error.svg";
import files from "../assets/empty-files.svg";
import chat from "../assets/empty-chat.svg";
import products from "../assets/empty-products.svg";
import purchases from "../assets/empty-purchases.svg";
import content from "../assets/empty-content.svg";
import saved from "../assets/empty-saved.svg";
import connection from "../assets/empty-connection.svg";
import paymentSuccess from "../assets/empty-payment-success.svg";
import paymentError from "../assets/empty-payment-error.svg";

const illustrations = {
  error,
  search,
  wallet,
  "card-error": cardError,
  files,
  chat,
  products,
  purchases,
  content,
  saved,
  connection,
  "payment-success": paymentSuccess,
  "payment-error": paymentError,
} as const;

export type EmptyStateIllustrationName = keyof typeof illustrations;

export interface EmptyStateIllustrationProps {
  name: EmptyStateIllustrationName;
  className?: string;
}

/** Decorative Figma artwork. Supply its meaning through the surrounding heading and copy. */
export function EmptyStateIllustration({
  name,
  className = "",
}: EmptyStateIllustrationProps) {
  return (
    <img
      src={illustrations[name]}
      alt=""
      aria-hidden="true"
      width={160}
      height={144}
      className={`sui-chart-appear block h-auto w-40 max-w-full shrink-0 ${className}`}
    />
  );
}
