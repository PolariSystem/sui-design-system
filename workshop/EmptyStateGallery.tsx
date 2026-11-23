import { EmptyState, type EmptyStateIllustrationName } from "../src";

const examples: [EmptyStateIllustrationName, string][] = [
  ["error", "Something went wrong"],
  ["search", "No search results"],
  ["wallet", "Your wallet is empty"],
  ["card-error", "Card error"],
  ["files", "No files found"],
  ["chat", "No chat history"],
  ["products", "No products found"],
  ["purchases", "No purchases yet"],
  ["content", "No content yet"],
  ["saved", "Nothing saved yet"],
  ["connection", "No connection"],
  ["payment-success", "Payment complete"],
  ["payment-error", "Payment failed"],
];

/** Artwork is reusable; consumers write recovery instructions for the actual situation. */
export function EmptyStateGallery() {
  return (
    <div
      aria-label="Empty-state illustration catalog"
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      {examples.map(([illustration, title]) => (
        <EmptyState
          key={illustration}
          variant="subtle"
          illustration={illustration}
          title={title}
          description={null}
        />
      ))}
    </div>
  );
}
